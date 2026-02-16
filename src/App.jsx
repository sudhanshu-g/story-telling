import { useCallback, useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import surveyJson from '../question.json'; // Importing JSON directly
import './App.css';

function App() {
  const [survey] = useState(() => new Model(surveyJson));
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const handleComplete = (sender) => {
      const results = JSON.stringify(sender.data);
      setIsCompleted(true);
      alert(results);
    };
    survey.onComplete.add(handleComplete);
    return () => {
      survey.onComplete.remove(handleComplete);
    };
  }, [survey]);

  const resetSurvey = useCallback(() => {
    survey.clear(false, true);
    setIsCompleted(false);
  }, [survey]);

  return (
    <div className="App">
      <Survey model={survey} />
      {isCompleted && (
        <button className="back-btn" onClick={resetSurvey}>
          Back to Survey
        </button>
      )}
    </div>
  );
}

export default App;
