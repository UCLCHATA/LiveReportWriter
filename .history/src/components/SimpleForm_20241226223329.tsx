import React, { useState } from 'react';

const SimpleForm: React.FC = () => {
  return (
    <div className="form-content">
      <img src="/assets/ucl-logo.png" alt="UCL Logo" className="logo" />
      <h1>CHATA Autism Report Generator</h1>
      <img src="/assets/nhs-logo.png" alt="NHS Logo" className="logo" />
      
      <button className="create-report-button">
        <i className="material-icons">add</i>
        Create New Report
      </button>

      <div className="form-section">
        <h3>ASC Status</h3>
        <select>
          <option value="">Select status</option>
          <option value="confirmed">ASC confirmed</option>
          <option value="not_confirmed">ASC not confirmed</option>
        </select>
      </div>

      <div className="form-section">
        <h3>ADHD Status</h3>
        <select>
          <option value="">Select status</option>
          <option value="no_concerns">No concerns identified</option>
          <option value="assessment">Assessment recommended</option>
          <option value="previously">Previously confirmed</option>
          <option value="confirmed">Confirmed during diagnosis</option>
        </select>
      </div>

      <div className="form-section">
        <h3>Professional Referrals</h3>
        <div className="referrals-grid">
          <label><input type="checkbox" /> Speech Pathology</label>
          <label><input type="checkbox" /> Occupational Therapy</label>
          <label><input type="checkbox" /> Psychology</label>
          <label><input type="checkbox" /> Psychiatry</label>
          <label><input type="checkbox" /> Pediatrician</label>
          <label><input type="checkbox" /> Genetics</label>
          <div className="other-referral">
            <label><input type="checkbox" /> Other:</label>
            <input type="text" placeholder="Specify other referrals" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="text-box">
          <i className="material-icons">description</i>
          <h3>Clinical Observations</h3>
          <textarea placeholder="Enter clinical observations"></textarea>
          <p className="hint">Double-click to expand</p>
        </div>
      </div>

      <div className="form-section">
        <div className="text-box">
          <i className="material-icons">star</i>
          <h3>Strengths and Abilities</h3>
          <textarea placeholder="Enter strengths and abilities"></textarea>
          <p className="hint">Double-click to expand</p>
        </div>
      </div>

      <div className="form-section">
        <div className="text-box">
          <i className="material-icons">priority_high</i>
          <h3>Priority Areas for Support</h3>
          <textarea placeholder="Enter priority areas for support"></textarea>
          <p className="hint">Double-click to expand</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleForm; 