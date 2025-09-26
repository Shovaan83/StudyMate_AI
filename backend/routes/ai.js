const express = require('express');
const multer = require('multer');
const router = express.Router();
const DeepSeekService = require('../services/deepseekService');
const fileParser = require('../services/fileParser');

const deepseekService = new DeepSeekService();

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (fileParser.isSupported(file.originalname)) {
      cb(null, true);
    } else {
      const supportedFormats = fileParser.getSupportedFormats().join(', ');
      cb(new Error(`Only the following file formats are supported: ${supportedFormats}`));
    }
  }
});

const validateSummarizeRequest = (req, res, next) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'Text content is required and must be a non-empty string'
    });
  }
  
  if (text.length > 50000) {
    return res.status(400).json({
      error: 'Text content too long. Maximum 50,000 characters allowed.'
    });
  }
  
  next();
};

router.post('/summarize', validateSummarizeRequest, async (req, res) => {
  try {
    const { text, subject, difficulty } = req.body;
    
    console.log(`Summarizing ${text.length} characters of content...`);
    
    const result = await deepseekService.summarizeText(text);
    
    console.log('Summary generated successfully');
    
    res.json({
      success: true,
      data: {
        summary: result,
        wordCount: result.split(' ').length,
        subject: subject || 'General',
        timestamp: new Date().toISOString(),
        originalLength: text.length
      },
      usage: deepseekService.getStatus()
    });
    
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(error.message.includes('Rate limit') ? 429 : 500).json({
      error: error.message,
      usage: deepseekService.getStatus()
    });
  }
});

router.post('/summarize/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }
    
    console.log(`Processing uploaded file: ${req.file.originalname} (${req.file.mimetype})`);
    
    const text = await fileParser.parseFile(req.file.buffer, req.file.originalname);
    const { subject, difficulty } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'No readable text content found in the uploaded file'
      });
    }
    
    console.log(`Extracted ${text.length} characters from ${req.file.originalname}`);
    
    const result = await deepseekService.summarizeText(text);
    
    console.log('File summary generated successfully');
    
    res.json({
      success: true,
      data: {
        summary: result,
        wordCount: result.split(' ').length,
        subject: subject || 'General',
        timestamp: new Date().toISOString(),
        filename: req.file.originalname,
        fileSize: req.file.size,
        extractedLength: text.length
      },
      usage: deepseekService.getStatus()
    });
    
  } catch (error) {
    console.error('File summarization error:', error);
    res.status(error.message.includes('Rate limit') ? 429 : 500).json({
      error: error.message,
      usage: deepseekService.getStatus()
    });
  }
});

router.post('/quiz', validateSummarizeRequest, async (req, res) => {
  try {
    const { text, questionCount, questionType, difficulty } = req.body;
    
    console.log(`Generating quiz with ${questionCount || 5} questions...`);
    
    const result = await deepseekService.generateQuiz(text, difficulty || 'medium', parseInt(questionCount) || 5);
    
    console.log('Quiz generated successfully');
    
    res.json({
      success: true,
      data: result,
      usage: deepseekService.getStatus()
    });
    
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(error.message.includes('Rate limit') ? 429 : 500).json({
      error: error.message,
      usage: deepseekService.getStatus()
    });
  }
});

router.post('/motivation', async (req, res) => {
  try {
    const { userName, studyStreak, recentActivity } = req.body;
    
    console.log('Generating motivational message...');
    
    const context = `User: ${userName || 'Student'}, Study streak: ${studyStreak || 0} days, Recent activity: ${recentActivity || 'studying'}`;
    const result = await deepseekService.generateMotivationalMessage(context);
    
    console.log('Motivational message generated');
    
    res.json({
      success: true,
      data: result,
      usage: deepseekService.getStatus()
    });
    
  } catch (error) {
    console.error('Motivation generation error:', error);
    res.status(error.message.includes('Rate limit') ? 429 : 500).json({
      error: error.message,
      usage: deepseekService.getStatus()
    });
  }
});

router.get('/usage', (req, res) => {
  try {
    const usage = deepseekService.getStatus();
    
    res.json({
      success: true,
      data: usage
    });
    
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/health', (req, res) => {
  try {
    const status = deepseekService.getStatus();
    const isHealthy = status.requestsToday < status.dailyLimit;
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'rate_limited',
        apiConfigured: !!process.env.DEEPSEEK_API_KEY,
        ...status
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: error.message,
      status: 'unhealthy'
    });
  }
});

module.exports = router;