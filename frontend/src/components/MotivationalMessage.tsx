import React, { useState, useEffect } from 'react';
import { FaRocket, FaSync, FaSpinner, FaHeart } from './Icons';
import apiService, { MotivationRequest } from '../services/api';
import './MotivationalMessage.css';

const MotivationalMessage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [recentActivity, setRecentActivity] = useState('');
  const [studyStreak, setStudyStreak] = useState(0);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUserName = localStorage.getItem('studymate_username') || '';
    const savedActivity = localStorage.getItem('studymate_recent_activity') || '';
    const savedStreak = parseInt(localStorage.getItem('studymate_study_streak') || '0');
    const lastMessage = localStorage.getItem('studymate_last_motivation');
    const lastMessageDate = localStorage.getItem('studymate_last_motivation_date');

    setUserName(savedUserName);
    setRecentActivity(savedActivity);
    setStudyStreak(savedStreak);

    // Show cached message if it's from today
    if (lastMessage && lastMessageDate) {
      const today = new Date().toDateString();
      if (lastMessageDate === today) {
        setMessage(lastMessage);
      }
    }
  }, []);

  const generateMotivation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request: MotivationRequest = {
        userName: userName || undefined,
        studyStreak,
        recentActivity: recentActivity || undefined
      };

      const response = await apiService.generateMotivation(request);
      
      if (response.success) {
        setMessage(response.data.message);
        
        // Cache the message for today
        const today = new Date().toDateString();
        localStorage.setItem('studymate_last_motivation', response.data.message);
        localStorage.setItem('studymate_last_motivation_date', today);
      }
    } catch (error: any) {
      console.error('Motivation generation error:', error);
      setError(error.message || 'Failed to generate motivational message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = () => {
    localStorage.setItem('studymate_username', userName);
    localStorage.setItem('studymate_recent_activity', recentActivity);
    localStorage.setItem('studymate_study_streak', studyStreak.toString());
  };

  const predefinedMessages = [
    "Every expert was once a beginner. Keep pushing forward!",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Don't watch the clock; do what it does. Keep going!",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "Believe you can and you're halfway there.",
    "Study hard, dream big, achieve greatness!"
  ];

  const getRandomPredefinedMessage = () => {
    const randomIndex = Math.floor(Math.random() * predefinedMessages.length);
    return predefinedMessages[randomIndex];
  };

  return (
    <div className="motivational-message">
      <div className="page-header">
        <h1 className="heading-1">Daily Motivation</h1>
        <p className="text-secondary">
          Get personalized motivational messages to keep you focused and inspired on your learning journey.
        </p>
      </div>

      {/* User Settings */}
      <div className="card settings-card">
        <div className="card-header">
          <h2 className="heading-3">Personalize Your Experience</h2>
        </div>
        <div className="card-body">
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label">Your Name (optional)</label>
              <input
                type="text"
                className="form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={saveUserData}
                placeholder="Enter your name..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Study Streak (days)</label>
              <input
                type="number"
                className="form-input"
                value={studyStreak}
                onChange={(e) => setStudyStreak(parseInt(e.target.value) || 0)}
                onBlur={saveUserData}
                min="0"
                max="365"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Recent Study Activity (optional)</label>
            <input
              type="text"
              className="form-input"
              value={recentActivity}
              onChange={(e) => setRecentActivity(e.target.value)}
              onBlur={saveUserData}
              placeholder="What have you been studying lately? e.g. Mathematics, Biology..."
            />
          </div>
        </div>
      </div>

      {/* Motivation Display */}
      <div className="motivation-display">
        {message ? (
          <div className="card motivation-card">
            <div className="card-body">
              <div className="motivation-icon">
                <FaRocket />
              </div>
              <blockquote className="motivation-text">
                {message}
              </blockquote>
              <div className="motivation-footer">
                <span className="motivation-signature">
                  <FaHeart className="heart-icon" />
                  StudyMate AI
                </span>
                <button
                  onClick={generateMotivation}
                  disabled={isLoading}
                  className="btn btn-secondary btn-sm"
                  title="Generate new message"
                >
                  <FaSync />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="empty-motivation">
                <FaRocket size={48} className="empty-icon" />
                <h3>Ready for some motivation?</h3>
                <p>Click below to get your personalized motivational message!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={generateMotivation}
          disabled={isLoading}
          className="btn btn-primary btn-lg"
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" />
              Generating...
            </>
          ) : (
            <>
              <FaRocket />
              Get Motivated!
            </>
          )}
        </button>

        <button
          onClick={() => setMessage(getRandomPredefinedMessage())}
          className="btn btn-secondary"
        >
          Quick Inspiration
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Daily Quotes Section */}
      <div className="daily-quotes">
        <h3 className="heading-3">Study Inspiration</h3>
        <div className="quotes-grid">
          <div className="quote-card">
            <p>"The expert in anything was once a beginner."</p>
            <cite>- Helen Hayes</cite>
          </div>
          <div className="quote-card">
            <p>"Learning never exhausts the mind."</p>
            <cite>- Leonardo da Vinci</cite>
          </div>
          <div className="quote-card">
            <p>"Education is the most powerful weapon which you can use to change the world."</p>
            <cite>- Nelson Mandela</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationalMessage;