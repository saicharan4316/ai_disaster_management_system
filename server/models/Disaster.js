import mongoose from 'mongoose';

const disasterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  locationDetails: {
    type: String,
    trim: true
  },
  images: [{
    type: String // Can hold Base64 strings or URLs
  }],
  status: {
    type: String,
    enum: ['pending_verification', 'published', 'rejected'],
    default: 'pending_verification'
  },
  reportedBy: {
    type: String,
    default: 'Anonymous'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  }
});

const Disaster = mongoose.model('Disaster', disasterSchema);
export default Disaster;
