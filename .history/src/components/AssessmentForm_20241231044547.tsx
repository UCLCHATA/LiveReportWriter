import React from 'react';

type AssessmentFormProps = {
  onClear: () => void;
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear }) => {
  return (
    <div className="form-content">
      <div className="combined-section">
        <div className="section-header">
          <i className="material-icons">check_circle</i>
          <h3>Status & Referrals</h3>
        </div>
        <div className="status-group">
          <div className="form-group">
            <label>ASC Status</label>
            <select>
              <option value="">--</option>
              <option value="confirmed">Confirmed</option>
              <option value="suspected">Suspected</option>
              <option value="ruled-out">Ruled Out</option>
            </select>
          </div>
          <div className="form-group">
            <label>ADHD Status</label>
            <select>
              <option value="">--</option>
              <option value="confirmed">Confirmed</option>
              <option value="suspected">Suspected</option>
              <option value="ruled-out">Ruled Out</option>
            </select>
          </div>
        </div>
        <div className="referrals-grid">
          <div className="referral-checkbox">
            <input type="checkbox" id="speech" />
            <label htmlFor="speech">Speech & Language</label>
          </div>
          <div className="referral-checkbox">
            <input type="checkbox" id="educational" />
            <label htmlFor="educational">Educational Psychology</label>
          </div>
          <div className="referral-checkbox">
            <input type="checkbox" id="sleep" />
            <label htmlFor="sleep">Sleep Support</label>
          </div>
          <div className="referral-checkbox">
            <input type="checkbox" id="occupational" />
            <label htmlFor="occupational">Occupational Therapy</label>
          </div>
          <div className="referral-checkbox">
            <input type="checkbox" id="mental" />
            <label htmlFor="mental">Mental Health</label>
          </div>
          <div className="referral-checkbox">
            <input type="checkbox" id="other" />
            <label htmlFor="other">Other</label>
          </div>
        </div>
        <div className="remarks-row">
          <input type="text" className="remarks-input" placeholder="Additional notes or remarks..." />
        </div>
      </div>

      <div className="text-areas-grid">
        <div className="grid-column">
          <div className="form-section">
            <div className="section-header">
              <i className="material-icons">description</i>
              <h3>Key Clinical Observations</h3>
            </div>
            <textarea 
              className="text-area"
              placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <i className="material-icons">priority_high</i>
              <h3>Priority Support Areas</h3>
            </div>
            <textarea 
              className="text-area"
              placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
            />
          </div>
        </div>

        <div className="grid-column">
          <div className="form-section">
            <div className="section-header">
              <i className="material-icons">star</i>
              <h3>Strengths & Abilities</h3>
            </div>
            <textarea 
              className="text-area"
              placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <i className="material-icons">lightbulb</i>
              <h3>Support Recommendations</h3>
            </div>
            <textarea 
              className="text-area"
              placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
            />
          </div>
        </div>
      </div>

      <div className="button-group">
        <button className="clear-button" onClick={onClear}>
          Clear Form
        </button>
        <button className="submit-button">
          Submit Assessment
        </button>
      </div>
    </div>
  );
}; 