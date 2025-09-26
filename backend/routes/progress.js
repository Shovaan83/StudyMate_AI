const express = require('express');
const router = express.Router();

let progressData = {
  topics: [],
  stats: {
    totalTopics: 0,
    understoodTopics: 0,
    needsRevisionTopics: 0,
    studyStreak: 0,
    lastStudyDate: null
  }
};

router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.post('/topic', (req, res) => {
  try {
    const { topicName, status, subject, difficulty, notes } = req.body;
    
    if (!topicName || !status) {
      return res.status(400).json({
        error: 'Topic name and status are required'
      });
    }
    
    if (!['understood', 'needs-revision', 'in-progress'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be one of: understood, needs-revision, in-progress'
      });
    }
    
    let topic = progressData.topics.find(t => t.name === topicName);
    
    if (topic) {
      const oldStatus = topic.status;
      topic.status = status;
      topic.subject = subject || topic.subject;
      topic.difficulty = difficulty || topic.difficulty;
      topic.notes = notes || topic.notes;
      topic.updatedAt = new Date().toISOString();

      updateStatsForStatusChange(oldStatus, status);
    } else {
      topic = {
        id: Date.now().toString(),
        name: topicName,
        status,
        subject: subject || 'General',
        difficulty: difficulty || 'intermediate',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      progressData.topics.push(topic);
      progressData.stats.totalTopics++;
      updateStatsForStatusChange(null, status);
    }
    
    updateStudyStreak();
    
    console.log(`📊 Progress updated for topic: ${topicName} (${status})`);
    
    res.json({
      success: true,
      data: {
        topic,
        stats: progressData.stats
      }
    });
    
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.delete('/topic/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const topicIndex = progressData.topics.findIndex(t => t.id === id);
    
    if (topicIndex === -1) {
      return res.status(404).json({
        error: 'Topic not found'
      });
    }
    
    const topic = progressData.topics[topicIndex];
    const oldStatus = topic.status;

    progressData.topics.splice(topicIndex, 1);
    progressData.stats.totalTopics--;
    updateStatsForStatusChange(oldStatus, null);
    
    console.log(`🗑️ Removed topic: ${topic.name}`);
    
    res.json({
      success: true,
      data: {
        removedTopic: topic,
        stats: progressData.stats
      }
    });
    
  } catch (error) {
    console.error('Topic removal error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    const stats = {
      ...progressData.stats,
      progressPercentage: progressData.stats.totalTopics > 0 
        ? Math.round((progressData.stats.understoodTopics / progressData.stats.totalTopics) * 100)
        : 0,
      topicsBySubject: getTopicsBySubject(),
      recentActivity: getRecentActivity()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/topics/:status', (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['understood', 'needs-revision', 'in-progress', 'all'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be one of: understood, needs-revision, in-progress, all'
      });
    }
    
    const topics = status === 'all' 
      ? progressData.topics
      : progressData.topics.filter(t => t.status === status);
    
    res.json({
      success: true,
      data: {
        topics,
        count: topics.length
      }
    });
    
  } catch (error) {
    console.error('Topics fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

function updateStatsForStatusChange(oldStatus, newStatus) {
  if (oldStatus === 'understood') {
    progressData.stats.understoodTopics--;
  } else if (oldStatus === 'needs-revision') {
    progressData.stats.needsRevisionTopics--;
  }
  
  if (newStatus === 'understood') {
    progressData.stats.understoodTopics++;
  } else if (newStatus === 'needs-revision') {
    progressData.stats.needsRevisionTopics++;
  }
  
  if (newStatus === null && oldStatus) {

  }
}

function updateStudyStreak() {
  const today = new Date().toDateString();
  const lastStudyDate = progressData.stats.lastStudyDate;
  
  if (!lastStudyDate) {
    progressData.stats.studyStreak = 1;
    progressData.stats.lastStudyDate = today;
  } else if (lastStudyDate === today) {

    return;
  } else {

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastStudyDate === yesterdayString) {

      progressData.stats.studyStreak++;
    } else {

      progressData.stats.studyStreak = 1;
    }
    
    progressData.stats.lastStudyDate = today;
  }
}

function getTopicsBySubject() {
  const subjects = {};
  
  progressData.topics.forEach(topic => {
    const subject = topic.subject || 'General';
    if (!subjects[subject]) {
      subjects[subject] = {
        total: 0,
        understood: 0,
        needsRevision: 0,
        inProgress: 0
      };
    }
    
    subjects[subject].total++;
    if (topic.status === 'understood') {
      subjects[subject].understood++;
    } else if (topic.status === 'needs-revision') {
      subjects[subject].needsRevision++;
    } else if (topic.status === 'in-progress') {
      subjects[subject].inProgress++;
    }
  });
  
  return subjects;
}

function getRecentActivity() {
  const recentTopics = progressData.topics
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
    
  return recentTopics.map(topic => ({
    name: topic.name,
    status: topic.status,
    subject: topic.subject,
    updatedAt: topic.updatedAt
  }));
}

module.exports = router;