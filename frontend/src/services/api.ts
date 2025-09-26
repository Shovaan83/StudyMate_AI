import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use relative URL for same domain
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  // In development, use explicit localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
);

export interface SummarizeRequest {
  text: string;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SummarizeResponse {
  success: boolean;
  data: {
    summary: string;
    wordCount: number;
    timestamp: string;
    subject: string;
  };
  usage: {
    totalRequests: number;
    dailyRequests: number;
    remainingDaily: number;
    lastRequestTime: number;
    rateLimitStatus: string;
  };
}

export interface QuizRequest {
  text: string;
  questionCount?: number;
  questionType?: 'multiple-choice' | 'short-answer' | 'mixed';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizQuestion {
  id: number;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResponse {
  success: boolean;
  data: {
    questions: QuizQuestion[];
    metadata: {
      totalQuestions: number;
      estimatedTime: string;
      difficulty: string;
    };
    timestamp: string;
  };
  usage: any;
}

export interface MotivationRequest {
  userName?: string;
  studyStreak?: number;
  recentActivity?: string;
}

export interface MotivationResponse {
  success: boolean;
  data: {
    message: string;
    timestamp: string;
    studyStreak: number;
  };
  usage: any;
}

export interface ProgressTopic {
  id: string;
  name: string;
  status: 'understood' | 'needs-revision' | 'in-progress';
  subject: string;
  difficulty: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalTopics: number;
  understoodTopics: number;
  needsRevisionTopics: number;
  studyStreak: number;
  lastStudyDate: string | null;
  progressPercentage: number;
  topicsBySubject: Record<string, {
    total: number;
    understood: number;
    needsRevision: number;
    inProgress: number;
  }>;
  recentActivity: Array<{
    name: string;
    status: string;
    subject: string;
    updatedAt: string;
  }>;
}

class ApiService {
  // Summarize text content
  async summarizeText(request: SummarizeRequest): Promise<SummarizeResponse> {
    const response = await api.post('/ai/summarize', request);
    return response.data;
  }

  // Summarize uploaded file
  async summarizeFile(file: File, options: Omit<SummarizeRequest, 'text'> = {}): Promise<SummarizeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.subject) formData.append('subject', options.subject);
    if (options.difficulty) formData.append('difficulty', options.difficulty);

    const response = await api.post('/ai/summarize/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Generate quiz
  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    const response = await api.post('/ai/quiz', request);
    return response.data;
  }

  // Generate motivational message
  async generateMotivation(request: MotivationRequest = {}): Promise<MotivationResponse> {
    const response = await api.post('/ai/motivation', request);
    return response.data;
  }

  // Get API usage stats
  async getUsageStats() {
    const response = await api.get('/ai/usage');
    return response.data;
  }

  // Health check
  async checkHealth() {
    const response = await api.get('/ai/health');
    return response.data;
  }

  // Progress tracking
  async getProgress() {
    const response = await api.get('/progress');
    return response.data;
  }

  async updateTopicProgress(topicName: string, status: string, options: {
    subject?: string;
    difficulty?: string;
    notes?: string;
  } = {}) {
    const response = await api.post('/progress/topic', {
      topicName,
      status,
      ...options
    });
    return response.data;
  }

  async deleteTopic(topicId: string) {
    const response = await api.delete(`/progress/topic/${topicId}`);
    return response.data;
  }

  async getProgressStats(): Promise<{ success: boolean; data: ProgressStats }> {
    const response = await api.get('/progress/stats');
    return response.data;
  }

  async getTopicsByStatus(status: string) {
    const response = await api.get(`/progress/topics/${status}`);
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;