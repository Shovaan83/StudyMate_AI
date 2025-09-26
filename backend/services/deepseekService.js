const axios = require('axios');

class DeepSeekService {
  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
    
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';
    this.model = 'deepseek/deepseek-chat'; 
    
    this.requestCount = 0;
    this.dailyRequestCount = 0;
    this.lastRequestTime = Date.now();
    this.lastDailyReset = new Date().toDateString();
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastDailyReset !== today) {
      this.dailyRequestCount = 0;
      this.lastDailyReset = today;
      console.log('Daily request counter reset');
    }
  }

  async makeRequestWithRetry(messages, maxRetries = 3) {
    this.checkDailyReset();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const requestsPerMinute = parseInt(process.env.REQUESTS_PER_MINUTE) || 20;
        const requestsPerDay = parseInt(process.env.REQUESTS_PER_DAY) || 1000;

        if (this.dailyRequestCount >= requestsPerDay) {
          throw new Error(`Daily quota exceeded (${requestsPerDay} requests)`);
        }

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000; 

        if (timeSinceLastRequest < minInterval) {
          await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
        }

        console.log(`Making DeepSeek API request (attempt ${attempt + 1}/${maxRetries})`);
        
        const response = await axios.post(`${this.apiUrl}/chat/completions`, {
          model: this.model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.8,
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'StudyMate AI'
          },
          timeout: 30000
        });

        this.requestCount++;
        this.dailyRequestCount++;
        this.lastRequestTime = Date.now();

        console.log(`DeepSeek API success (${this.dailyRequestCount} requests today)`);
        
        return response.data.choices[0].message.content;

      } catch (error) {
        console.error(`eepSeek API error (attempt ${attempt + 1}):`, error.message);

        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Response:', error.response.data);
          
          if (error.response.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || Math.pow(2, attempt) * 1000;
            console.log(`Rate limited, waiting ${retryAfter}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            continue;
          }
          
          if (error.response.status === 402) {
            throw new Error('API quota exceeded or payment required');
          }
          
          if (error.response.status >= 400 && error.response.status < 500) {
            throw new Error(`DeepSeek API client error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
          }
        }

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; 
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`DeepSeek API failed after ${maxRetries} attempts`);
  }

  async summarizeText(text) {
    if (!text || text.length < 10) {
      throw new Error('Text is too short to summarize');
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant specialized in creating concise, educational summaries. Focus on key concepts, main ideas, and important details that would help a student understand and remember the material.'
      },
      {
        role: 'user',
        content: `Please provide a comprehensive yet concise summary of the following text. Focus on the main ideas, key concepts, and important details:\n\n${text}`
      }
    ];

    return await this.makeRequestWithRetry(messages);
  }

  async generateQuiz(text, difficulty = 'medium', questionCount = 5) {
    if (!text || text.length < 20) {
      throw new Error('Text is too short to generate quiz questions');
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert educator who creates engaging quiz questions. Generate clear, educational questions with multiple choice answers that test understanding of the material.'
      },
      {
        role: 'user',
        content: `Based on the following text, create ${questionCount} ${difficulty} difficulty multiple-choice questions. Format each question with the question followed by 4 options (A, B, C, D) and indicate the correct answer at the end.

Text to analyze:
${text}

Please format as:
1. [Question]
   A) [Option A]
   B) [Option B]
   C) [Option C]
   D) [Option D]
   Correct Answer: [Letter]

2. [Continue for all questions...]`
      }
    ];

    return await this.makeRequestWithRetry(messages);
  }

  async generateMotivationalMessage(context = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are an encouraging study coach who provides short, uplifting, and motivational messages to help students stay focused and positive about their learning journey.'
      },
      {
        role: 'user',
        content: `Generate a short, encouraging motivational message for a student. ${context ? `Context: ${context}` : 'Keep it general and uplifting.'} The message should be 1-2 sentences and inspire continued learning.`
      }
    ];

    return await this.makeRequestWithRetry(messages);
  }

  getStatus() {
    return {
      service: 'DeepSeek',
      model: this.model,
      requestsToday: this.dailyRequestCount,
      dailyLimit: parseInt(process.env.REQUESTS_PER_DAY) || 1000,
      configured: !!this.apiKey,
      lastRequestTime: new Date(this.lastRequestTime).toISOString()
    };
  }
}

module.exports = DeepSeekService;