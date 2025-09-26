import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const menuItems = [
    {
      id: 'summarize',
      label: 'Summarize Notes',
      icon: '📄',
      description: 'Upload or paste lecture notes to get AI-powered summaries'
    },
    {
      id: 'quiz',
      label: 'Generate Quiz',
      icon: '❓',
      description: 'Create practice questions from your study material'
    },
    {
      id: 'progress',
      label: 'Track Progress',
      icon: '📊',
      description: 'Monitor your learning progress and study streaks'
    },
    {
      id: 'motivation',
      label: 'Daily Motivation',
      icon: '🚀',
      description: 'Get personalized motivational messages to stay focused'
    }
  ];

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Features</h2>
          <button 
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span style={{fontSize: '16px'}}>×</span>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
                aria-label={item.label}
              >
                <div className="nav-item-icon">
                  <span style={{fontSize: '18px'}}>{item.icon}</span>
                </div>
                <div className="nav-item-content">
                  <span className="nav-item-label">{item.label}</span>
                  <span className="nav-item-description">{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <div className="usage-info">
            <p className="usage-label">Free Tier Usage</p>
            <div className="usage-bar">
              <div className="usage-progress" style={{width: '20%'}}></div>
            </div>
            <p className="usage-text">20/100 requests today</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;