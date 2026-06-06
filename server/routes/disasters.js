import express from 'express';
import Disaster from '../models/Disaster.js';
import Subscriber from '../models/Subscriber.js';
import { protect } from '../middleware/authMiddleware.js';
import { translateText } from '../utils/translator.js';
import { sendNotification } from '../utils/notifier.js';

const router = express.Router();

// @desc    Report a new disaster (Public)
// @route   POST /api/disasters
// @access  Public
router.post('/', async (req, res) => {
  const { title, description, severity, state, district, locationDetails, images } = req.body;

  if (!title || !description || !state || !district) {
    return res.status(400).json({ message: 'Title, description, state, and district are required.' });
  }

  try {
    const disaster = await Disaster.create({
      title,
      description,
      severity: severity || 'medium',
      state,
      district,
      locationDetails,
      images: images || [], // can receive base64 strings
      status: 'pending_verification' // default
    });

    res.status(201).json({
      message: 'Disaster report submitted successfully for official verification.',
      disaster
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all published disasters (Public Feed)
// @route   GET /api/disasters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const disasters = await Disaster.find({ status: 'published' }).sort({ reportedAt: -1 });
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all disasters (Admin Queue)
// @route   GET /api/disasters/all
// @access  Private (Admin Only)
router.get('/all', protect, async (req, res) => {
  try {
    const disasters = await Disaster.find().sort({ reportedAt: -1 });
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify and publish/reject a disaster report (Admin Only)
// @route   PUT /api/disasters/:id/verify
// @access  Private (Admin Only)
router.put('/:id/verify', protect, async (req, res) => {
  const { status } = req.body;

  if (!['published', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "published" or "rejected".' });
  }

  try {
    const disaster = await Disaster.findById(req.id || req.params.id);

    if (!disaster) {
      return res.status(404).json({ message: 'Disaster report not found.' });
    }

    disaster.status = status;
    disaster.verifiedAt = Date.now();
    await disaster.save();

    // If published, broadcast regional alerts to subscribers in the reported state
    if (status === 'published') {
      const subscribers = await Subscriber.find({ state: disaster.state });
      
      const broadcastDetails = {
        successCount: 0,
        failCount: 0,
        logs: []
      };

      if (subscribers.length > 0) {
        // Construct alert content
        const rawAlertText = `ALERT: ${disaster.severity.toUpperCase()} severity ${disaster.title} reported at ${disaster.district}, ${disaster.state}. Details: ${disaster.description}. Take precautions.`;

        // Process translations and notifications asynchronously/parallel
        const broadcastPromises = subscribers.map(async (sub) => {
          try {
            // Translate the raw English text to subscriber's regional language
            const translatedText = await translateText(rawAlertText, sub.language);

            // Dispatch notification
            const log = await sendNotification({
              disasterId: disaster._id,
              subscriberId: sub._id,
              recipientNumber: sub.phoneNumber,
              state: sub.state,
              language: sub.language,
              originalText: rawAlertText,
              translatedText
            });

            if (log.status === 'sent') {
              broadcastDetails.successCount++;
            } else {
              broadcastDetails.failCount++;
            }
            
            broadcastDetails.logs.push({
              phone: sub.phoneNumber,
              lang: sub.language,
              translated: translatedText,
              status: log.status
            });
          } catch (err) {
            broadcastDetails.failCount++;
            console.error(`Broadcast failed for subscriber ${sub.phoneNumber}:`, err.message);
          }
        });

        await Promise.all(broadcastPromises);
      }

      return res.json({
        message: `Disaster verified and published successfully. Regional broadcasts triggered.`,
        disaster,
        broadcastSummary: {
          totalSubscribers: subscribers.length,
          success: broadcastDetails.successCount,
          failed: broadcastDetails.failCount,
          logs: broadcastDetails.logs
        }
      });
    }

    res.json({
      message: `Disaster report status updated to "${status}".`,
      disaster
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
