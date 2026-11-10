const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hospitalRoutes = require('./routes/hospitalRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const alertRoutes = require('./routes/alertRoutes');
const sanitizeRequest = require('./middleware/sanitize');
const hpp = require('hpp');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many emergency requests, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

  app.use(helmet());
  app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
  }))
  app.use(express.json({ limit: '10kb' }));
  app.use(sanitizeRequest);
  app.use(hpp());
  app.use(globalLimiter);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/emergencies', emergencyLimiter, emergencyRoutes);
  app.use('/api/alerts', emergencyLimiter, alertRoutes);

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB connected successfully');
})
.catch((error) => {
    console.log('MongoDB connection error:', error.message);
    process.exit(1);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'HLERS server is running'});
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});