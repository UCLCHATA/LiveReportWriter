import React, { useState } from 'react';
import { MilestoneTracker } from './components/MilestoneTracker';

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState({ name: '', email: '' });

  return (
    <div className="app">
      <header>
        <div className="logo-container">
          <img src="/assets/ucl-logo.png" alt="UCL Logo" className="ucl-logo" />
        </div>
        <div className="title-container">
          <h1>CHATA Autism Report Generator</h1>
          <div className="chata-id">CHATA ID: {/* Add ID generation logic */}</div>
        </div>
        <div className="logo-container">
          <img src="/assets/nhs-logo.png" alt="NHS Logo" className="nhs-logo" />
        </div>
      </header>

      <main>
        <div className="right-panel active">
          <div className="form-container active">
            {!showForm ? (
              <div className="overlay">
                <button className="create-report-button" onClick={() => setShowForm(true)}>
                  Create New Report
                </button>
              </div>
            ) : (
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
                    <div className="referral-other-row">
                      <input type="checkbox" id="other" />
                      <label htmlFor="other">Other</label>
                      <input type="text" className="referral-other-input" placeholder="Specific Remarks" />
                    </div>
                  </div>
                </div>
                {/* Rest of the form sections */}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logos">
            <img src="/assets/ucl-logo.png" alt="UCL Logo" className="footer-logo" />
            <img src="/assets/nhs-logo.png" alt="NHS Logo" className="footer-logo nhs-logo" />
          </div>
          <div>© 2024 UCL & NHS. For support contact: support@chata.ucl.ac.uk</div>
        </div>
      </footer>
    </div>
  );
}; 