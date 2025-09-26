import React from 'react';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <span style={{fontSize: '20px'}}>×</span> : <span style={{fontSize: '20px'}}>☰</span>}
          </button>
          
          <div className="logo">
            <span className="logo-icon" style={{fontSize: '20px'}}>🧠</span>
            <h1 className="logo-text">StudyMate AI</h1>
          </div>
        </div>
        
        <div className="header-right">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;