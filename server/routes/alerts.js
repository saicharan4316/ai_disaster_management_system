import express from 'express';
import Subscriber from '../models/Subscriber.js';
import NotificationLog from '../models/NotificationLog.js';
import { protect } from '../middleware/authMiddleware.js';
import { translateText } from '../utils/translator.js';
import { sendNotification } from '../utils/notifier.js';

const router = express.Router();

// @desc    Manually broadcast custom alert to a state/district (Admin Only)
// @route   POST /api/alerts/broadcast
// @access  Private (Admin Only)
router.post('/broadcast', protect, async (req, res) => {
  const { message, state, district } = req.body;

  if (!message || !state) {
    return res.status(400).json({ message: 'Message text and target State are required.' });
  }

  try {
    // Find subscribers in the target state
    const query = { state };
    if (district) {
      query.district = district;
    }

    const subscribers = await Subscriber.find(query);

    if (subscribers.length === 0) {
      return res.status(404).json({ message: 'No registered subscribers found in the selected region.' });
    }

    const broadcastDetails = {
      successCount: 0,
      failCount: 0,
      logs: []
    };

    const broadcastPromises = subscribers.map(async (sub) => {
      try {
        // Translate message to regional language
        const translatedText = await translateText(message, sub.language);

        // Send alert
        const log = await sendNotification({
          disasterId: null, // Custom alert, no specific disaster report ID
          subscriberId: sub._id,
          recipientNumber: sub.phoneNumber,
          state: sub.state,
          language: sub.language,
          originalText: message,
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
        console.error(`Custom broadcast failed for ${sub.phoneNumber}:`, err.message);
      }
    });

    await Promise.all(broadcastPromises);

    res.json({
      message: `Direct broadcast sent to ${subscribers.length} subscribers.`,
      summary: {
        total: subscribers.length,
        success: broadcastDetails.successCount,
        failed: broadcastDetails.failCount,
        logs: broadcastDetails.logs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all alert logs for simulator (Admin / Public verification)
// @route   GET /api/alerts/logs
// @access  Public (So public users can also see the simulator outputs in demo)
router.get('/logs', async (req, res) => {
  try {
    const logs = await NotificationLog.find()
      .populate('disasterId', 'title severity')
      .populate('subscriberId', 'name')
      .sort({ sentAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
