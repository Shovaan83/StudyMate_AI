import React, { useState } from 'react';
import { FaQuestionCircle, FaSpinner, FaPlay, FaCheck } from './Icons';
import apiService, { QuizRequest, QuizQuestion } from '../services/api';
import './QuizGenerator.css';

const QuizGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'mixed'>('mixed');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to generate a quiz from');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: QuizRequest = {
        text: inputText.trim(),
        questionCount,
        questionType,
        difficulty
      };

      const response = await apiService.generateQuiz(request);
      
      if (response.success) {
        setQuiz(response.data.questions);
        setCurrentQuestion(0);
        setUserAnswers({});
        setShowResults(false);
      }
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    quiz.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.length) * 100);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setInputText('');
  };

  if (quiz && !showResults) {
    const question = quiz[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.length - 1;

    return (
      <div className="quiz-generator">
        <div className="quiz-header">
          <h1 className="heading-2">Quiz Mode</h1>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {quiz.length}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="question-text">{question.question}</h3>
            
            {question.type === 'multiple-choice' && question.options ? (
              <div className="options-list">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, option.charAt(0))}
                    className={`option-button ${
                      userAnswers[question.id] === option.charAt(0) ? 'selected' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  value={userAnswers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                />
              </div>
            )}

            <div className="quiz-navigation">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
              )}
              
              <div className="flex-spacer" />
              
              {isLastQuestion ? (
                <button
                  onClick={() => setShowResults(true)}
                  className="btn btn-primary"
                  disabled={!userAnswers[question.id]}
                >
                  <FaCheck /> Finish Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="btn btn-primary"
                  disabled={!userAnswers[question.id]}
                >
                  Next <FaPlay />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && quiz) {
    const score = calculateScore();
    
    return (
      <div className="quiz-generator">
        <div className="quiz-results">
          <h1 className="heading-2">Quiz Results</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
            <p className="score-text">
              You got {quiz.filter(q => userAnswers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()).length} out of {quiz.length} questions correct!
            </p>
          </div>

          <div className="results-list">
            {quiz.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
              
              return (
                <div key={question.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <h4 className="question-title">Question {index + 1}</h4>
                  <p className="question-text">{question.question}</p>
                  <div className="answer-comparison">
                    <div className="user-answer">
                      <strong>Your answer:</strong> {userAnswer || 'No answer'}
                    </div>
                    <div className="correct-answer">
                      <strong>Correct answer:</strong> {question.correctAnswer}
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button onClick={resetQuiz} className="btn btn-primary">
              Generate New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-generator">
      <div className="page-header">
        <h1 className="heading-1">Generate Quiz</h1>
        <p className="text-secondary">
          Create practice questions from your study material to test your understanding.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="heading-3">Input Study Material</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Paste your study content:</label>
            <textarea
              className="form-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text you want to generate quiz questions from..."
              rows={6}
              maxLength={50000}
            />
          </div>

          <div className="quiz-options">
            <div className="form-group">
              <label className="form-label">Number of Questions</label>
              <select
                className="form-select"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question Type</label>
              <select
                className="form-select"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
              >
                <option value="mixed">Mixed</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
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

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading || !inputText.trim()}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Generating Quiz...
              </>
            ) : (
              <>
                <FaQuestionCircle />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;