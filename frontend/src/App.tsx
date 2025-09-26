import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteSummarizer from './components/NoteSummarizer';
import QuizGenerator from './components/QuizGenerator';
import ProgressTracker from './components/ProgressTracker';
import MotivationalMessage from './components/MotivationalMessage';
import './App.css';

type ActiveTab = 'summarize' | 'quiz' | 'progress' | 'motivation';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summarize');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'summarize':
        return <NoteSummarizer />;
      case 'quiz':
        return <QuizGenerator />;
      case 'progress':
        return <ProgressTracker />;
      case 'motivation':
        return <MotivationalMessage />;
      default:
        return <NoteSummarizer />;
    }
  };

  return (
    <div className="app">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="app-layout">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={(tab: string) => setActiveTab(tab as ActiveTab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="main-content">
          <div className="container">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
