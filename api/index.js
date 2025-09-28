const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const aiRoutes = require('../backend/routes/ai');
const progressRoutes = require('../backend/routes/progress');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.VERCEL_URL ? 
    [`https://${process.env.VERCEL_URL}`, 'http://localhost:3000'] : 
    ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1000 * 60,
  max: process.env.REQUESTS_PER_MINUTE || 20,
  message: {
    error: 'Too many requests. Please wait a minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    // Test DeepSeek service initialization
    const deepseekService = require('../backend/services/deepseekService');
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      config: {
        hasApiKey: !!process.env.DEEPSEEK_API_KEY,
        apiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
        requestsPerMinute: process.env.REQUESTS_PER_MINUTE || 20,
        requestsPerDay: process.env.REQUESTS_PER_DAY || 1000
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// AI routes
app.use('/api/ai', aiRoutes);

// Progress routes
app.use('/api/progress', progressRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = (req, res) => {
  return app(req, res);
};