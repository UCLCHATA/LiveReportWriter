import React, { useState } from 'react';
import MilestoneTracker from './MilestoneTracker';
import { Milestone } from './types';

interface FormProps {
  onSubmit?: (data: any) => void;
  onClear?: () => void;
}

const Form: React.FC<FormProps> = ({ onSubmit, onClear }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const handleMilestoneUpdate = (milestone: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
  };

  return (
    <div className="form-container">
      <MilestoneTracker 
        milestones={milestones}
        onMilestoneUpdate={handleMilestoneUpdate}
      />
      <div className="form-content">
        <div className="text-box-container clinical">
          <h4><i className="material-icons">visibility</i> Key Clinical Observations</h4>
          <textarea 
            className="field-preview"
            placeholder="Enter key clinical observations and findings from the assessment..."
          />
        </div>

        <div className="text-box-container strengths">
          <h4><i className="material-icons">star</i> Strengths & Abilities</h4>
          <textarea 
            className="field-preview"
            placeholder="Document the individual's strengths, skills, and positive attributes..."
          />
        </div>

        <div className="text-box-container priority">
          <h4><i className="material-icons">priority_high</i> Priority Support Areas</h4>
          <textarea 
            className="field-preview"
            placeholder="List the main areas requiring support and intervention..."
          />
        </div>

        <div className="text-box-container support">
          <h4><i className="material-icons">help</i> Support Recommendations</h4>
          <textarea 
            className="field-preview"
            placeholder="Provide specific recommendations for support and interventions..."
          />
        </div>
      </div>
    </div>
  );
};

export default Form; 