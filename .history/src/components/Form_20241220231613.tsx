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
        <MilestoneTracker 
          milestones={milestones}
          onMilestoneUpdate={handleMilestoneUpdate}
          className="milestone-section"
        />
        <div className="form-content">
          <div className="text-box-container clinical">
            <h4><i className="material-icons">visibility</i> Key Clinical Observations</h4>
            <textarea 
              className="field-preview"
              placeholder="Enter key clinical observations and findings from the assessment..."
              value={formData.clinicalObservations}
              onChange={handleTextAreaChange('clinicalObservations')}
            />
          </div>

          <div className="text-box-container strengths">
            <h4><i className="material-icons">star</i> Strengths & Abilities</h4>
            <textarea 
              className="field-preview"
              placeholder="Document the individual's strengths, skills, and positive attributes..."
              value={formData.strengths}
              onChange={handleTextAreaChange('strengths')}
            />
          </div>

          <div className="text-box-container priority">
            <h4><i className="material-icons">priority_high</i> Priority Support Areas</h4>
            <textarea 
              className="field-preview"
              placeholder="List the main areas requiring support and intervention..."
              value={formData.priorityAreas}
              onChange={handleTextAreaChange('priorityAreas')}
            />
          </div>

          <div className="text-box-container support">
            <h4><i className="material-icons">help</i> Support Recommendations</h4>
            <textarea 
              className="field-preview"
              placeholder="Provide specific recommendations for support and interventions..."
              value={formData.recommendations}
              onChange={handleTextAreaChange('recommendations')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form; 