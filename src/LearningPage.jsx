import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import details from '../details.json';
import './LearningPage.css';

const LearningPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state?.results;

    if (!results) {
        return (
            <div className="learning-container error-state">
                <p>No results found. Please complete the survey first to get your personalized learning plan.</p>
                <button onClick={() => navigate('/')} className="back-btn">Take Survey</button>
            </div>
        );
    }

    const archetypeKey = results.archetype || 'The Informational Expert'; 
    const totalScore = results.totalScore;
    const archetypeData = details.archetypes[archetypeKey];
    const strategicGoalData = details.strategic_goals[archetypeKey];
    const skillImprovementsData = details.skill_improvements;

    const improvements = useMemo(() => {
        const list = [];
        for (const [key, value] of Object.entries(results)) {
            // Check if the value is low (1 or 3) and if we have improvement data for this question key
            if ((value === 1 || value === 3 || value === '1' || value === '3') && skillImprovementsData[key]) {
                list.push({
                    questionKey: key,
                    ...skillImprovementsData[key]
                });
            }
        }
        return list;
    }, [results, skillImprovementsData]);

    return (
        <div className="learning-container">
            <header className="learning-header">
                <div className="header-content">
                    <h1>Your Narrative DNA: <span className="highlight">{archetypeKey}</span></h1>
                    <button onClick={() => window.print()} className="print-btn" aria-label="Print results">
                        🖨️ Print Results
                    </button>
                </div>
                {totalScore !== undefined && (
                    <h2 className="score-subtitle">Mastery Score: {totalScore} / 50</h2>
                )}
            </header>
            
            {archetypeData && (
                <section className="archetype-section card">
                    <h2>Archetype Breakdown</h2>
                    <p className="definition"><strong>Definition:</strong> {archetypeData.definition}</p>
                    <p className="explanation">{archetypeData.explanation}</p>
                    
                    <div className="strengths-blindspots-grid">
                        <div className="column strengths">
                            <h4>Strengths</h4>
                            <ul>
                                {archetypeData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className="column blindspots">
                            <h4>Blind Spots</h4>
                            <ul>
                                {archetypeData.blind_spots.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="famous-example">
                         <strong>Famous Example:</strong> {archetypeData.famous_example}
                    </div>
                </section>
            )}

            {strategicGoalData && (
                <section className="strategic-goal-section card">
                     <h2>Strategic Growth Goal</h2>
                     <h3 className="goal-statement">{strategicGoalData.goal_statement}</h3>
                     <p>{strategicGoalData.explanation}</p>
                     <h4>Learning Roadmap:</h4>
                     <ul className="roadmap-list">
                        {strategicGoalData.roadmap.map((step, i) => <li key={i}>{step}</li>)}
                     </ul>
                </section>
            )}

            {improvements.length > 0 && (
                <section className="improvements-section">
                    <h2>Action Plan for Improvement</h2>
                    <p className="subtitle">Based on your specific answers, here are the skills to focus on.</p>
                    {improvements.map((item, index) => (
                        <div key={index} className="improvement-item card">
                            <h3>{item.skill} <span className="question-ref">(Area: {item.questionKey})</span></h3>
                            <p><strong>Diagnosis:</strong> {item.diagnosis}</p>
                            <p><strong>Why it matters:</strong> {item.explanation}</p>
                            
                            <div className="examples-box">
                                <div className="example poor">
                                    <strong>Poor Example:</strong> "{item.examples.poor}"
                                </div>
                                <div className="example good">
                                    <strong>Good Example:</strong> "{item.examples.good}"
                                </div>
                            </div>
                            
                            <h4>Immediate Action Items:</h4>
                            <ul>
                                {item.action_items.map((action, i) => <li key={i}>{action}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            <div className="actions-footer">
                <h4>* The above explanations use examples of presentation skills, but the learnings can apply to all kinds of storytelling.</h4>
                <button 
                  onClick={() => navigate('/', { 
                    state: { 
                      surveyData: results,
                      isCompleted: true
                    }
                  })} 
                  className="back-btn primary"
                >
                    Back to Results
                </button>
            </div>
        </div>
    );
};

export default LearningPage;
