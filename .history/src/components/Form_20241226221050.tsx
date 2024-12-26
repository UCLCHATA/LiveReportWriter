import React, { useState } from 'react';
import { FormProps } from './types';

const Form: React.FC<FormProps> = ({ isEnabled, clinicianInfo, onClear }) => {
  const [ascStatus, setAscStatus] = useState('');
  const [adhdStatus, setAdhdStatus] = useState('');
  const [referrals, setReferrals] = useState<string[]>([]);
  const [otherReferral, setOtherReferral] = useState('');
  const [observations, setObservations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [priorities, setPriorities] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const handleSubmit = () => {
    if (!ascStatus || !adhdStatus) {
      alert('Please select both ASC and ADHD status');
      return;
    }
    
    // TODO: Submit form data
    console.log({
      clinicianInfo,
      status: { asc: ascStatus, adhd: adhdStatus },
      referrals,
      otherReferral,
      observations,
      strengths,
      priorities,
      recommendations
    });
    
    alert('Assessment submitted successfully');
    onClear();
  };

  const handleTextAreaDoubleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!isEnabled) return;
    const textarea = e.currentTarget;
    textarea.style.height = textarea.style.height === '300px' ? '120px' : '300px';
  };

  return (
    <div className={`form-container ${!isEnabled ? 'disabled' : ''}`}>
      <div className="form-content">
        {/* Status Section */}
        <div className="section status-section">
          <h4><i className="material-icons">check_circle_outline</i>Status</h4>
          <div className="status-group">
            <div className="status-item">
              <h4>ASC Status</h4>
              <select 
                value={ascStatus}
                onChange={(e) => setAscStatus(e.target.value)}
                disabled={!isEnabled}
              >
                <option value="">--</option>
                <option value="confirmed">ASC confirmed</option>
                <option value="not_confirmed">ASC not confirmed</option>
              </select>
            </div>
            
            <div className="status-item">
              <h4>ADHD Status</h4>
              <select 
                value={adhdStatus}
                onChange={(e) => setAdhdStatus(e.target.value)}
                disabled={!isEnabled}
              >
                <option value="">--</option>
                <option value="no_concerns">No concerns identified</option>
                <option value="assessment">Assessment recommended</option>
                <option value="previously">Previously confirmed</option>
                <option value="confirmed">Confirmed during diagnosis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Referrals */}
        <div className="section referrals-section">
          <h4><i className="material-icons">share</i>Professional Referrals</h4>
          <div className="referrals-grid">
            <label>
              <input 
                type="checkbox"
                value="Speech & Language"
                checked={referrals.includes('Speech & Language')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setReferrals([...referrals, e.target.value]);
                  } else {
                    setReferrals(referrals.filter(r => r !== e.target.value));
                  }
                }}
                disabled={!isEnabled}
              />
              Speech & Language
            </label>
            <label>
              <input 
                type="checkbox"
                value="Educational Psychology"
                checked={referrals.includes('Educational Psychology')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setReferrals([...referrals, e.target.value]);
                  } else {
                    setReferrals(referrals.filter(r => r !== e.target.value));
                  }
                }}
                disabled={!isEnabled}
              />
              Educational Psychology
            </label>
            <label>
              <input 
                type="checkbox"
                value="Sleep Support"
                checked={referrals.includes('Sleep Support')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setReferrals([...referrals, e.target.value]);
                  } else {
                    setReferrals(referrals.filter(r => r !== e.target.value));
                  }
                }}
                disabled={!isEnabled}
              />
              Sleep Support
            </label>
            <div className="referral-other-row">
              <label>
                <input 
                  type="checkbox"
                  value="Other"
                  checked={referrals.includes('Other')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setReferrals([...referrals, e.target.value]);
                    } else {
                      setReferrals(referrals.filter(r => r !== e.target.value));
                    }
                  }}
                  disabled={!isEnabled}
                />
                Other
              </label>
              <input
                type="text"
                className="referral-other-input"
                placeholder="Specific Remarks"
                value={otherReferral}
                onChange={(e) => setOtherReferral(e.target.value)}
                disabled={!isEnabled || !referrals.includes('Other')}
              />
            </div>
          </div>
        </div>

        {/* Middle Sections Grid */}
        <div className="middle-sections-grid">
          {/* Clinical Observations */}
          <div className="text-box-container clinical">
            <div className="text-box-header">
              <i className="material-icons">visibility</i>
              <h4>Key Clinical Observations</h4>
            </div>
            <div className="text-box-content">
              <textarea
                className="text-area"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                onDoubleClick={handleTextAreaDoubleClick}
                placeholder="• Social engagement patterns
• Communication style
• Response to activities
• Behavioral patterns
• Notable strengths/challenges"
                disabled={!isEnabled}
                spellCheck={true}
              />
            </div>
          </div>

          {/* Strengths & Abilities */}
          <div className="text-box-container strengths">
            <div className="text-box-header">
              <i className="material-icons">stars</i>
              <h4>Strengths & Abilities</h4>
            </div>
            <div className="text-box-content">
              <textarea
                className="text-area"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                onDoubleClick={handleTextAreaDoubleClick}
                placeholder="• Memory (e.g., Strong recall of sequences)
• Visual (e.g., Pattern recognition)
• Physical (e.g., Fine motor skills)
• Creative (e.g., Problem-solving abilities)
• Focus (e.g., Sustained attention)
• Problem-solving (e.g., Logical approach)"
                disabled={!isEnabled}
                spellCheck={true}
              />
            </div>
          </div>

          {/* Priority Support Areas */}
          <div className="text-box-container priority">
            <div className="text-box-header">
              <i className="material-icons">priority_high</i>
              <h4>Priority Support Areas</h4>
            </div>
            <div className="text-box-content">
              <textarea
                className="text-area"
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
                onDoubleClick={handleTextAreaDoubleClick}
                placeholder="• Assessment data patterns
• Family priorities
• School observations
• Clinical judgment"
                disabled={!isEnabled}
                spellCheck={true}
              />
            </div>
          </div>

          {/* Support Recommendations */}
          <div className="text-box-container support">
            <div className="text-box-header">
              <i className="material-icons">lightbulb</i>
              <h4>Support Recommendations</h4>
            </div>
            <div className="text-box-content">
              <textarea
                className="text-area"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                onDoubleClick={handleTextAreaDoubleClick}
                placeholder="• Strength-based strategies
• Practical implementation
• Home/school alignment
• Family resources"
                disabled={!isEnabled}
                spellCheck={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Button Group */}
      <div className="button-group">
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={!isEnabled}
        >
          Submit Assessment
        </button>
        <button 
          className="clear-button"
          onClick={onClear}
          disabled={!isEnabled}
        >
          Clear Form
        </button>
      </div>
    </div>
  );
};

export default Form; 