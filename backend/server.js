const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 1000 * 60, 
  max: process.env.REQUESTS_PER_MINUTE || 20, 
  message: {
    error: 'Too many requests. Please wait a minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const dailyLimiter = rateLimit({
  windowMs: 1000 * 60 * 60 * 24,
  max: process.env.REQUESTS_PER_DAY || 100,
  message: {
    error: 'Daily API limit reached. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => 'global' 
});

app.use(limiter);
app.use(dailyLimiter);

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3002',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(txt|md|pdf|doc|docx|ppt|pptx)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only text files, PDFs, Word documents, and PowerPoint files are allowed'));
    }
  }
});

const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');

app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyMate AI Backend running on port ${PORT}`);
  console.log(`📊 Rate limits: ${process.env.REQUESTS_PER_MINUTE || 20}/minute, ${process.env.REQUESTS_PER_DAY || 1000}/day`);
  console.log(`🔑 DeepSeek API configured: ${process.env.DEEPSEEK_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;