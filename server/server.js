import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Models
import User from './models/User.js';
import Subscriber from './models/Subscriber.js';

// Import Routes
import authRoutes from './routes/auth.js';
import disasterRoutes from './routes/disasters.js';
import alertRoutes from './routes/alerts.js';
import subscriberRoutes from './routes/subscribers.js';

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Allow large payloads for base64 image submissions
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Seed Database Function
const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = 'admin@disaster.gov.in';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        username: 'GovtAdmin',
        email: adminEmail,
        password: 'adminpassword123', // Will be hashed automatically by pre-save hook
        role: 'admin'
      });
      console.log('Seeded Default Admin:');
      console.log(`- Email: ${adminEmail}`);
      console.log('- Password: adminpassword123');
    } else {
      console.log('Admin user already exists in DB.');
    }

    // 2. Seed Default Subscribers specified by User
    const defaultSubscribers = [
      {
        name: 'Tamil Nadu Representative',
        phoneNumber: '+916281950381',
        state: 'Tamil Nadu',
        district: 'Chennai',
        language: 'ta' // Tamil
      },
      {
        name: 'Telangana Representative',
        phoneNumber: '+917989164924',
        state: 'Telangana',
        district: 'Hyderabad',
        language: 'te' // Telugu
      },
      {
        name: 'Karnataka Representative',
        phoneNumber: '+919182649601',
        state: 'Karnataka',
        district: 'Bengaluru',
        language: 'kn' // Kannada
      },
      {
        name: 'Delhi Representative',
        phoneNumber: '+919999999999', // A default dummy number
        state: 'Delhi',
        district: 'New Delhi',
        language: 'hi' // Hindi
      }
    ];

    for (const sub of defaultSubscribers) {
      const exists = await Subscriber.findOne({ phoneNumber: sub.phoneNumber });
      if (!exists) {
        await Subscriber.create(sub);
        console.log(`Seeded subscriber: ${sub.name} (${sub.phoneNumber}) for ${sub.state} [${sub.language}]`);
      }
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
};

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Atlas Connected successfully.');
    await seedDatabase();
    
    // Start Listening
    app.listen(PORT, () => {
      console.log(`Disaster Management API Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
