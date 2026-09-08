import React, { useState, useEffect } from 'react';
import { getQuizForArticle } from '../api/articleApi';

const QuizCard = ({ articleId, articleTitle = '', articleCategory = '' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('initial'); // 'initial' | 'active' | 'results'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const data = await getQuizForArticle(articleId);
        if (isMounted) {
          setQuestions(data || []);
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        if (isMounted) {
          setQuestions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (articleId) {
      loadQuiz();
      // Reset quiz state when switching articles
      setQuizState('initial');
      setCurrentIndex(0);
      setSelectedOption(null);
      setScore(0);
    }

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  if (loading || questions.length === 0) {
    return null;
  }

  const quizTopic = articleTitle.includes('CRISPR') ? 'CRISPR' : articleCategory || 'Topic';

  const handleStartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizState('active');
  };

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return; // already answered
    const currentQ = questions[currentIndex];
    setSelectedOption(index);
    if (index === currentQ.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizState('results');
    }
  };

  const handleResetToArticle = () => {
    setQuizState('initial');
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
  };

  // 1. Initial State
  if (quizState === 'initial') {
    return (
      <div id="quizCard" className="quiz-card">
        <div className="quiz-icon-wrapper">
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="quiz-title">Test Your Understanding</h2>
        <p id="quizSubtitle" className="quiz-subtitle">
          Test Your {quizTopic} Knowledge — {questions.length} questions
        </p>
        <button className="quiz-btn" type="button" onClick={handleStartQuiz}>
          Take the Quiz
        </button>
      </div>
    );
  }

  // 2. Active Quiz State
  if (quizState === 'active') {
    const currentQ = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div id="quizCard" className="quiz-card">
        {/* Progress Tracker */}
        <div className="quiz-progress-container quiz-fade-in">
          <div className="quiz-progress-text">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="quiz-progress-bar-bg">
            <div className="quiz-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Question & Options */}
        <div className="quiz-question-container quiz-fade-in" key={currentIndex}>
          <h3 className="quiz-question-text">{currentQ.question}</h3>

          <div className="quiz-options-list">
            {currentQ.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.answer;
              const hasAnswered = selectedOption !== null;

              let cardClass = 'quiz-option-card';
              if (hasAnswered) {
                if (isCorrectAnswer) {
                  cardClass += ' correct';
                } else if (isSelected && !isCorrectAnswer) {
                  cardClass += ' incorrect';
                } else {
                  cardClass += ' disabled';
                }
              }

              return (
                <div
                  key={idx}
                  className={cardClass}
                  onClick={() => handleSelectOption(idx)}
                >
                  <span className="quiz-option-label">{label}</span>
                  <span className="quiz-option-text">{option}</span>
                  <div className="quiz-option-status-icon">
                    {hasAnswered && isCorrectAnswer && (
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    {hasAnswered && isSelected && !isCorrectAnswer && (
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="quiz-action-wrapper">
            <button
              className={`quiz-next-btn ${selectedOption !== null ? 'visible' : ''}`}
              type="button"
              onClick={handleNextQuestion}
            >
              <span>{currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}</span>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Results Screen
  let resultTitle = '';
  let resultMessage = '';
  if (score === questions.length) {
    resultTitle = 'Perfect Score!';
    resultMessage = 'Excellent! You clearly have a deep understanding of this topic. Keep up the amazing work!';
  } else if (score >= 2) {
    resultTitle = 'Great Job!';
    resultMessage = 'You answered most questions correctly. A solid grasp of the core concepts!';
  } else {
    resultTitle = 'Keep Learning!';
    resultMessage = 'A quick review of the article might help clarify some of the key concepts. Give it another try!';
  }

  return (
    <div id="quizCard" className="quiz-card">
      <div className="quiz-results-container quiz-fade-in">
        <div className="quiz-score-badge">
          <span className="quiz-score-num">{score}</span>
          <span className="quiz-score-total">of {questions.length}</span>
        </div>

        <h3 className="quiz-results-headline">{resultTitle}</h3>
        <p className="quiz-results-body">{resultMessage}</p>

        <div className="quiz-results-actions">
          <button className="quiz-secondary-btn" id="retakeQuizBtn" type="button" onClick={handleStartQuiz}>
            Retake Quiz
          </button>
          <button className="quiz-secondary-btn" id="resetQuizCardBtn" type="button" onClick={handleResetToArticle}>
            Back to Article
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
