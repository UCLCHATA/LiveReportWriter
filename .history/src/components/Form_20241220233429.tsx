import React, { useState, useEffect } from 'react';
import MilestoneTracker from './MilestoneTracker';
import { Milestone } from './types';
import { defaultMilestones } from './defaultMilestones';

interface FormProps {
  onSubmit?: (data: any) => void;
  onClear?: () => void;
}

const Form: React.FC<FormProps> = ({ onSubmit, onClear }) => {
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [formData, setFormData] = useState({
    clinicalObservations: '',
    strengths: '',
    priorityAreas: '',
    recommendations: ''
  });

  const handleMilestoneUpdate = (milestone: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
  };

  const handleTextAreaChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  useEffect(() => {
    // Initialize with default milestones
    setMilestones(defaultMilestones);
  }, []);

  return (
    <div className="main-container">
      <div className="form-container">
        {/* Left side - Milestone Tracker */}
        <MilestoneTracker 
          milestones={milestones}
          onMilestoneUpdate={handleMilestoneUpdate}
        />
        
        {/* Right side - Form Content */}
        <div className="form-content">
          {/* Status Section */}
          <div className="status-section">
            <div className="status-group">
              <div className="status-item">
                <h4>ASC Status</h4>
                <select name="asc_status">
                  <option value="">--</option>
                  <option>ASC confirmed</option>
                  <option>ASC not confirmed</option>
                </select>
              </div>
              
              <div className="status-item">
                <h4>ADHD Status</h4>
                <select name="adhd_status">
                  <option value="">--</option>
                  <option>No concerns identified</option>
                  <option>Assessment recommended</option>
                  <option>Previously confirmed</option>
                  <option>Confirmed during diagnosis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Referrals */}
          <div className="referrals-section">
            <h4><i className="material-icons">share</i>Professional Referrals</h4>
            <div className="referrals-grid">
              <label><input type="checkbox" value="Speech & Language" /> Speech & Language</label>
              <label><input type="checkbox" value="Educational Psychology" /> Educational Psychology</label>
              <label><input type="checkbox" value="Sleep Support" /> Sleep Support</label>
              <div className="referral-other-row">
                <label><input type="checkbox" value="Other" /> Other</label>
                <input type="text" className="referral-other-input" placeholder="Specific Remarks" />
              </div>
            </div>
          </div>

          {/* Clinical Observations */}
          <div className="text-box-container clinical">
            <h4><i className="material-icons">visibility</i> Key Clinical Observations</h4>
            <textarea 
              className="field-preview"
              placeholder="Enter key clinical observations and findings from the assessment..."
              value={formData.clinicalObservations}
              onChange={handleTextAreaChange('clinicalObservations')}
            />
          </div>

          {/* Strengths & Abilities */}
          <div className="text-box-container strengths">
            <h4><i className="material-icons">star</i> Strengths & Abilities</h4>
            <textarea 
              className="field-preview"
              placeholder="Document the individual's strengths, skills, and positive attributes..."
              value={formData.strengths}
              onChange={handleTextAreaChange('strengths')}
            />
          </div>

          {/* Priority Support Areas */}
          <div className="text-box-container priority">
            <h4><i className="material-icons">priority_high</i> Priority Support Areas</h4>
            <textarea 
              className="field-preview"
              placeholder="List the main areas requiring support and intervention..."
              value={formData.priorityAreas}
              onChange={handleTextAreaChange('priorityAreas')}
            />
          </div>

          {/* Support Recommendations */}
          <div className="text-box-container support">
            <h4><i className="material-icons">help</i> Support Recommendations</h4>
            <textarea 
              className="field-preview"
              placeholder="Provide specific recommendations for support and interventions..."
              value={formData.recommendations}
              onChange={handleTextAreaChange('recommendations')}
            />
          </div>

          {/* Form Actions */}
          <div className="button-group">
            <button className="submit-button" onClick={() => onSubmit?.(formData)}>Generate Report</button>
            <button className="clear-button" onClick={() => onClear?.()}>Clear Form</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form; 