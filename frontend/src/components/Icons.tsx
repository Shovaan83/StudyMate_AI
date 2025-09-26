import React from 'react';

// Simple icon replacement using Unicode symbols
export const Icons = {
  // Basic UI icons
  bars: '☰',
  times: '×',
  brain: '🧠',
  
  // Feature icons
  fileAlt: '📄',
  upload: '📁',
  download: '⬇',
  copy: '📋',
  trash: '🗑',
  
  // Quiz icons
  questionCircle: '❓',
  play: '▶',
  check: '✓',
  
  // Progress icons
  chartLine: '📊',
  clock: '🕒',
  exclamationTriangle: '⚠',
  plus: '+',
  
  // Motivational icons
  rocket: '🚀',
  heart: '❤',
  sync: '🔄',
  spinner: '⟳'
};

interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '' }) => {
  return (
    <span 
      className={className}
      style={{ 
        fontSize: `${size}px`, 
        lineHeight: 1,
        display: 'inline-block'
      }}
    >
      {Icons[name]}
    </span>
  );
};

// Individual icon components for easy replacement
export const FaBars = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="bars" size={size} className={className} />;

export const FaTimes = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="times" size={size} className={className} />;

export const FaBrain = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="brain" size={size} className={className} />;

export const FaFileAlt = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="fileAlt" size={size} className={className} />;

export const FaUpload = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="upload" size={size} className={className} />;

export const FaDownload = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="download" size={size} className={className} />;

export const FaCopy = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="copy" size={size} className={className} />;

export const FaTrash = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="trash" size={size} className={className} />;

export const FaQuestionCircle = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="questionCircle" size={size} className={className} />;

export const FaPlay = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="play" size={size} className={className} />;

export const FaCheck = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="check" size={size} className={className} />;

export const FaChartLine = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="chartLine" size={size} className={className} />;

export const FaClock = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="clock" size={size} className={className} />;

export const FaExclamationTriangle = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="exclamationTriangle" size={size} className={className} />;

export const FaPlus = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="plus" size={size} className={className} />;

export const FaRocket = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="rocket" size={size} className={className} />;

export const FaHeart = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="heart" size={size} className={className} />;

export const FaSync = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="sync" size={size} className={className} />;

export const FaSpinner = ({ size = 18, className = '' }: { size?: number; className?: string }) => 
  <Icon name="spinner" size={size} className={className} />;