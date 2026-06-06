import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
  disasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster',
    required: false
  },
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscriber',
    required: false
  },
  recipientNumber: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  error: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
export default NotificationLog;
