import React, { useState } from 'react';
import { MilestoneTracker } from './components/MilestoneTracker';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState({ name: '', email: '' });

  return (
    <div className="app">
      <header>
        <div className="logo-container">
          <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
        </div>
        <div className="title-container">
          <h1>CHATA Autism Report Generator</h1>
          <div className="chata-id">CHATA ID: {/* Add ID generation logic */}</div>
        </div>
        <div className="logo-container">
          <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
        </div>
      </header>

      <main>
        {/* Left Panel - Only show when form is active */}
        {showForm && (
          <div className="left-panel active">
            <MilestoneTracker />
          </div>
        )}

        {/* Right Panel - Always show */}
        <div className="right-panel active">
          {!showForm ? (
            <div className="overlay">
              <button className="create-report-button" onClick={() => setShowForm(true)}>
                Create New Report
              </button>
            </div>
          ) : (
            <div className="form-container active">
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
                      </select>
                    </div>
                    <div className="form-group">
                      <label>ADHD Status</label>
                      <select>
                        <option value="">--</option>
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
                    <input type="text" className="remarks-input" placeholder="Remarks" />
                  </div>
                </div>

                {/* 2x2 Grid for Text Areas */}
                <div className="text-areas-grid">
                  {/* Left Column */}
                  <div className="grid-column">
                    {/* Clinical Observations Section */}
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

                    {/* Priority Areas Section */}
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

                  {/* Right Column */}
                  <div className="grid-column">
                    {/* Strengths Section */}
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

                    {/* Recommendations Section */}
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

                {/* Form Buttons */}
                <div className="button-group">
                  <button className="clear-button" onClick={() => setShowForm(false)}>
                    Clear Form
                  </button>
                  <button className="submit-button">
                    Submit Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logos">
            <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
            <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
          </div>
          <div>© 2024 UCL & NHS. For support contact: uclchata@gmail.com</div>
        </div>
      </footer>
    </div>
  );
}; 