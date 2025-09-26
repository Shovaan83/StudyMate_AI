import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaCheck, 
  FaExclamationTriangle, 
  FaClock,
  FaPlus,
  FaTrash 
} from './Icons';
import apiService, { ProgressStats, ProgressTopic } from '../services/api';
import './ProgressTracker.css';

const ProgressTracker: React.FC = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [topics, setTopics] = useState<ProgressTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    name: '',
    subject: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    notes: ''
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, topicsResponse] = await Promise.all([
        apiService.getProgressStats(),
        apiService.getTopicsByStatus('all')
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (topicsResponse.success) {
        setTopics(topicsResponse.data.topics);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTopicStatus = async (topicName: string, status: string) => {
    try {
      const topic = topics.find(t => t.name === topicName);
      await apiService.updateTopicProgress(topicName, status, {
        subject: topic?.subject,
        difficulty: topic?.difficulty,
        notes: topic?.notes
      });
      await loadProgressData(); // Refresh data
    } catch (error) {
      console.error('Failed to update topic status:', error);
    }
  };

  const addNewTopic = async () => {
    if (!newTopic.name.trim()) return;

    try {
      await apiService.updateTopicProgress(newTopic.name, 'in-progress', {
        subject: newTopic.subject || 'General',
        difficulty: newTopic.difficulty,
        notes: newTopic.notes
      });

      setNewTopic({ name: '', subject: '', difficulty: 'intermediate', notes: '' });
      setShowAddTopic(false);
      await loadProgressData();
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      await apiService.deleteTopic(topicId);
      await loadProgressData();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'understood':
        return <FaCheck className="status-icon understood" />;
      case 'needs-revision':
        return <FaExclamationTriangle className="status-icon needs-revision" />;
      case 'in-progress':
        return <FaClock className="status-icon in-progress" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'understood':
        return 'success';
      case 'needs-revision':
        return 'warning';
      case 'in-progress':
        return 'info';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="progress-tracker">
        <div className="loading">
          <div className="spinner" />
          Loading progress data...
        </div>
      </div>
    );
  }

  return (
    <div className="progress-tracker">
      <div className="page-header">
        <h1 className="heading-1">Track Progress</h1>
        <p className="text-secondary">
          Monitor your learning journey and keep track of topics you've mastered.
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.progressPercentage}%</div>
                <div className="stat-label">Overall Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon understood">
                <FaCheck />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.understoodTopics}</div>
                <div className="stat-label">Topics Mastered</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon needs-revision">
                <FaExclamationTriangle />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.needsRevisionTopics}</div>
                <div className="stat-label">Need Revision</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon in-progress">
                <FaClock />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.studyStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <p className="progress-text">
              {stats.understoodTopics} of {stats.totalTopics} topics completed
            </p>
          </div>
        </div>
      )}

      {/* Topics Section */}
      <div className="topics-section">
        <div className="section-header">
          <h2 className="heading-2">Your Topics</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddTopic(true)}
          >
            <FaPlus /> Add Topic
          </button>
        </div>

        {/* Add Topic Form */}
        {showAddTopic && (
          <div className="card add-topic-form">
            <div className="card-header">
              <h3 className="heading-4">Add New Topic</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Topic Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Photosynthesis, Calculus Derivatives..."
                />
              </div>

              <div className="topic-form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTopic.subject}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Biology, Mathematics..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={newTopic.difficulty}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  value={newTopic.notes}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this topic..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddTopic(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={addNewTopic}
                  disabled={!newTopic.name.trim()}
                >
                  Add Topic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topics List */}
        {topics.length > 0 ? (
          <div className="topics-list">
            {topics.map((topic) => (
              <div key={topic.id} className="topic-card">
                <div className="topic-header">
                  <div className="topic-info">
                    <h3 className="topic-name">{topic.name}</h3>
                    <div className="topic-meta">
                      <span className={`badge badge-${getStatusColor(topic.status)}`}>
                        {getStatusIcon(topic.status)}
                        {topic.status.replace('-', ' ')}
                      </span>
                      <span className="topic-subject">{topic.subject}</span>
                      <span className="topic-difficulty">{topic.difficulty}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="delete-btn"
                    title="Delete topic"
                  >
                    <FaTrash />
                  </button>
                </div>

                {topic.notes && (
                  <p className="topic-notes">{topic.notes}</p>
                )}

                <div className="topic-actions">
                  <button
                    onClick={() => updateTopicStatus(topic.name, 'in-progress')}
                    className={`status-btn ${topic.status === 'in-progress' ? 'active' : ''}`}
                  >
                    <FaClock /> In Progress
                  </button>
                  <button
                    onClick={() => updateTopicStatus(topic.name, 'needs-revision')}
                    className={`status-btn ${topic.status === 'needs-revision' ? 'active' : ''}`}
                  >
                    <FaExclamationTriangle /> Needs Revision
                  </button>
                  <button
                    onClick={() => updateTopicStatus(topic.name, 'understood')}
                    className={`status-btn ${topic.status === 'understood' ? 'active' : ''}`}
                  >
                    <FaCheck /> Understood
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaChartLine size={48} />
            <h3>No topics yet</h3>
            <p>Add your first topic to start tracking your progress!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddTopic(true)}
            >
              <FaPlus /> Add Your First Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;