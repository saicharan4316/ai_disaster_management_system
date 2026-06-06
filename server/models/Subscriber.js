import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    required: true, // e.g. 'ta' (Tamil), 'te' (Telugu), 'kn' (Kannada), 'hi' (Hindi)
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
