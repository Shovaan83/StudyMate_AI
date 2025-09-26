import React, { useState, useCallback } from 'react';
import { 
  FaUpload, 
  FaFileAlt, 
  FaSpinner, 
  FaCopy, 
  FaDownload,
  FaTrash
} from './Icons';
import apiService, { SummarizeRequest } from '../services/api';
import './NoteSummarizer.css';

interface Summary {
  id: string;
  summary: string;
  wordCount: number;
  timestamp: string;
  subject: string;
  originalText: string;
  filename?: string;
}

const NoteSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Check if file type is supported
    const supportedExtensions = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const fileName = file.name.toLowerCase();
    const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isSupported) {
      setError('Unsupported file format. Please use: .txt, .md, .pdf, .doc, .docx, .ppt, .pptx');
      return;
    }

    // For text files, read directly on frontend
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsText(file);
    } else {
      // For binary files (PDF, DOCX, PPTX), send to backend for processing
      await handleFileSummarization(file);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      await handleFileUpload(file);
    } else {
      setError('Please upload a supported file format');
    }
  }, [handleFileUpload]);

  const handleFileSummarization = async (file: File) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🚀 Uploading file for summarization:', file.name);
      
      const response = await apiService.summarizeFile(file, {
        subject,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced'
      });
      
      if (response.success) {
        const newSummary: Summary = {
          id: Date.now().toString(),
          summary: response.data.summary,
          wordCount: response.data.wordCount,
          timestamp: new Date().toISOString(),
          subject: response.data.subject || subject,
          originalText: `[File: ${file.name}]`,
          filename: file.name
        };
        
        setSummaries(prev => [newSummary, ...prev]);
        
        // Clear input after successful summarization
        setInputText('');
        
        console.log('✅ File summarization completed');
      } else {
        setError('Failed to summarize file');
      }
    } catch (error: any) {
      console.error('File summarization error:', error);
      setError(error.message || 'Failed to summarize file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: SummarizeRequest = {
        text: inputText.trim(),
        subject: subject || undefined,
        difficulty
      };

      const response = await apiService.summarizeText(request);
      
      if (response.success) {
        const newSummary: Summary = {
          id: Date.now().toString(),
          summary: response.data.summary,
          wordCount: response.data.wordCount,
          timestamp: response.data.timestamp,
          subject: response.data.subject || subject || 'General',
          originalText: inputText.trim()
        };

        setSummaries(prev => [newSummary, ...prev]);
        
        // Clear input after successful summarization
        setInputText('');
        
        // Save to localStorage for persistence
        const savedSummaries = JSON.parse(localStorage.getItem('studymate_summaries') || '[]');
        savedSummaries.unshift(newSummary);
        localStorage.setItem('studymate_summaries', JSON.stringify(savedSummaries.slice(0, 10))); // Keep last 10
      }
    } catch (error: any) {
      console.error('Summarization error:', error);
      setError(error.message || 'Failed to summarize text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadSummary = (summary: Summary) => {
    const content = `# Summary - ${summary.subject}\n\nGenerated on: ${new Date(summary.timestamp).toLocaleString()}\nOriginal word count: ${summary.wordCount}\n\n## Summary\n\n${summary.summary}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${summary.subject}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeSummary = (id: string) => {
    setSummaries(prev => prev.filter(s => s.id !== id));
    
    // Update localStorage
    const savedSummaries = JSON.parse(localStorage.getItem('studymate_summaries') || '[]');
    const filteredSummaries = savedSummaries.filter((s: Summary) => s.id !== id);
    localStorage.setItem('studymate_summaries', JSON.stringify(filteredSummaries));
  };

  // Load summaries from localStorage on component mount
  React.useEffect(() => {
    const savedSummaries = JSON.parse(localStorage.getItem('studymate_summaries') || '[]');
    setSummaries(savedSummaries);
  }, []);

  return (
    <div className="note-summarizer">
      <div className="page-header">
        <h1 className="heading-1">Summarize Notes</h1>
        <p className="text-secondary">
          Upload your lecture notes or paste text to get AI-powered summaries that help you learn faster.
        </p>
      </div>

      <div className="input-section">
        <div className="card">
          <div className="card-header">
            <h2 className="heading-3">Input Your Notes</h2>
          </div>
          <div className="card-body">
            {/* File Upload Area */}
            <div 
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FaUpload size={32} />
              <p>Drag and drop a file here, or</p>
              <label htmlFor="file-upload" className="btn btn-secondary btn-sm">
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileInputChange}
                className="sr-only"
              />
              <p className="text-xs text-light">Supported formats: .txt, .md, .pdf, .doc, .docx, .ppt, .pptx (Max 5MB)</p>
            </div>

            {/* Text Input */}
            <div className="form-group">
              <label className="form-label">Or paste your notes here:</label>
              <textarea
                className="form-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your lecture notes, readings, or any study material here..."
                rows={8}
                maxLength={50000}
              />
              <div className="text-xs text-light">
                {inputText.length}/50,000 characters
              </div>
            </div>

            {/* Options */}
            <div className="options-row">
              <div className="form-group">
                <label className="form-label">Subject (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Biology, Mathematics, History..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim()}
              className="btn btn-primary btn-lg"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <FaFileAlt />
                  Summarize Notes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summaries List */}
      {summaries.length > 0 && (
        <div className="summaries-section">
          <h2 className="heading-2">Your Summaries</h2>
          <div className="summaries-list">
            {summaries.map((summary) => (
              <div key={summary.id} className="card summary-card">
                <div className="card-header">
                  <div className="summary-header">
                    <div>
                      <h3 className="heading-4">{summary.subject}</h3>
                      <p className="text-sm text-secondary">
                        {new Date(summary.timestamp).toLocaleDateString()} • {summary.wordCount} words
                      </p>
                    </div>
                    <div className="summary-actions">
                      <button
                        onClick={() => copyToClipboard(summary.summary)}
                        className="btn btn-secondary btn-sm"
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => downloadSummary(summary)}
                        className="btn btn-secondary btn-sm"
                        title="Download as markdown"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => removeSummary(summary.id)}
                        className="btn btn-secondary btn-sm"
                        title="Remove summary"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="summary-content">
                    {summary.summary && summary.summary.split('\n').map((paragraph, index) => (
                      <p key={index} className="summary-paragraph">
                        {paragraph}
                      </p>
                    ))}
                    {!summary.summary && (
                      <p className="summary-paragraph text-muted">
                        No summary available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteSummarizer;