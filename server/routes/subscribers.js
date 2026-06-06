import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all subscribers (Admin Only)
// @route   GET /api/subscribers
// @access  Private (Admin Only)
router.get('/', protect, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new subscriber (Public or Admin)
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  const { name, phoneNumber, state, district, language } = req.body;

  if (!name || !phoneNumber || !state || !language) {
    return res.status(400).json({ message: 'Name, phone number, state, and language code are required.' });
  }

  try {
    // Check if phone number already subscribed
    let subscriber = await Subscriber.findOne({ phoneNumber });

    if (subscriber) {
      // Update details if already exists
      subscriber.name = name;
      subscriber.state = state;
      subscriber.district = district || subscriber.district;
      subscriber.language = language;
      await subscriber.save();
      return res.status(200).json({ message: 'Subscriber contact details updated.', subscriber });
    }

    subscriber = await Subscriber.create({
      name,
      phoneNumber,
      state,
      district,
      language
    });

    res.status(201).json({ message: 'Subscribed successfully to emergency alerts.', subscriber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a subscriber (Admin Only)
// @route   DELETE /api/subscribers/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    await subscriber.deleteOne();
    res.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
