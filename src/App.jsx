import { useCallback, useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import 'survey-core/defaultV2.min.css';
import surveyJson from '../question.json'; // Importing JSON directly
import './App.css';
import LearningPage from './LearningPage';
import { trackEvent } from './telemetry';

function SurveyComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [survey] = useState(() => {
     const s = new Model(surveyJson);
     s.start();
     // Check if we have returning state
     if (location.state?.surveyData) {
         s.data = location.state.surveyData;
         // If data exists, we probably want to be in "display" mode or just show results?
         // User wants "go back to results". Results view is usually survey in display mode or just the buttons?
         // The original code shows survey + buttons when completed.
         // If we set data, survey might be editable unless we set mode.
         // But let's assume review mode.
         s.mode = 'display'; 
     }
     return s;
  });

  const [isCompleted, setIsCompleted] = useState(!!location.state?.isCompleted);

  useEffect(() => {
    // Only track session start if not restoring state
    if (!location.state?.surveyData && !isCompleted) {
        trackEvent('Survey Session Start', { timestamp: new Date().toISOString() });
    }
  }, []); // Run once on mount

  useEffect(() => {
    const handleComplete = (sender) => {
      setIsCompleted(true);
      const archetype = sender.getVariable("archetype") || sender.data.archetype;
      const totalScore = sender.getVariable("totalScore");
      trackEvent('Survey Submitted', { 
          archetype: archetype,
          score: totalScore,
          timestamp: new Date().toISOString()
      });
    };
    if (!isCompleted) { // Only add listener if not already completed/restored
        survey.onComplete.add(handleComplete);
    }
    return () => {
      survey.onComplete.remove(handleComplete);
    };
  }, [survey, isCompleted]);

  const handleLearnMore = () => {
    // Clone data to avoid reference issues
    const results = { ...survey.data };
    
    // Explicitly check for 'archetype' variable, as calculatedValues store result in variables sometimes
    const archetype = survey.getVariable("archetype");
    if (archetype) {
        results.archetype = archetype;
    }

    const score = survey.getVariable("totalScore");
    if (score) {
        results.totalScore = score;
    }
    trackEvent('Learn More Clicked', { 
        archetype: archetype,
        score: score,
        timestamp: new Date().toISOString()
    });

    // Pass survey data and completion state so we can restore it when coming back
    navigate('/learning', { 
        state: { 
            results, 
            surveyData: survey.data,
            isCompleted: true 
        } 
    });
  };

  const resetSurvey = useCallback(() => {
    survey.clear(false, true);
    survey.mode = 'edit'; // Ensure we go back to edit mode
    setIsCompleted(false);
    trackEvent('Survey Session Start', { timestamp: new Date().toISOString(), type: 'restart' });
    // Clear history state so we don't restore on refresh?
    navigate('/', { replace: true, state: {} });
  }, [survey, navigate]);

  return (
    <div className="App">
      <Survey model={survey} />
      {isCompleted && (
        <div className="results-actions">
           <button className="back-btn" onClick={resetSurvey}>
             Retake Survey
           </button>
           <button className="learn-btn" onClick={handleLearnMore}>
             Help me learn
           </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SurveyComponent />} />
        <Route path="/learning" element={<LearningPage />} />
      </Routes>
    </Router>
  );
}

export default App;
