import React, { useEffect } from 'react';
import { useFormState } from '../hooks/useFormState';

type AssessmentFormProps = {
  onClear: () => void;
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear }) => {
  const { globalState, updateFormData, clearState } = useFormState();

  useEffect(() => {
    if (!globalState.formData) {
      updateFormData({
        ascStatus: '',
        adhdStatus: '',
        referrals: {
          speech: false,
          educational: false,
          sleep: false,
          occupational: false,
          mental: false,
          other: false
        },
        remarks: '',
        clinicalObservations: '',
        priorityAreas: '',
        strengths: '',
        recommendations: ''
      });
    }
  }, []);

  if (!globalState.formData) {
    return <div>Loading...</div>;
  }

  const formData = globalState.formData;

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    updateFormData({ [field]: e.target.value });
  };

  const handleCheckboxChange = (field: keyof typeof formData.referrals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateFormData({
      referrals: {
        ...formData.referrals,
        [field]: e.target.checked
      }
    });
  };

  const handleStatusChange = (newStatus: 'draft' | 'submitted') => {
    updateFormData({ status: newStatus });
  };

  const handleClear = () => {
    clearState();
    onClear();
  };

  return (
    <div className="form-container active">
      <div className="form-content">
        {/* Status & Referrals Section */}
        <div className="combined-section">
          <div className="section-header">
            <h3>Status & Referrals</h3>
          </div>
          
          <div className="status-group">
            <div className="form-group">
              <label>ASC Status</label>
              <select 
                value={formData.ascStatus} 
                onChange={handleInputChange('ascStatus')}
              >
                <option value="">--</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="ruled-out">Ruled Out</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>ADHD Status</label>
              <select 
                value={formData.adhdStatus} 
                onChange={handleInputChange('adhdStatus')}
              >
                <option value="">--</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="ruled-out">Ruled Out</option>
              </select>
            </div>
          </div>

          <div className="referrals-section">
            <div className="section-header">
              <h3>Referrals</h3>
            </div>
            <div className="referrals-grid">
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="speech"
                  checked={formData.referrals.speech}
                  onChange={handleCheckboxChange('speech')}
                />
                <label htmlFor="speech">Speech & Language</label>
              </div>
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="educational"
                  checked={formData.referrals.educational}
                  onChange={handleCheckboxChange('educational')}
                />
                <label htmlFor="educational">Educational Psychology</label>
              </div>
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="sleep"
                  checked={formData.referrals.sleep}
                  onChange={handleCheckboxChange('sleep')}
                />
                <label htmlFor="sleep">Sleep Support</label>
              </div>
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="occupational"
                  checked={formData.referrals.occupational}
                  onChange={handleCheckboxChange('occupational')}
                />
                <label htmlFor="occupational">Occupational Therapy</label>
              </div>
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="mental"
                  checked={formData.referrals.mental}
                  onChange={handleCheckboxChange('mental')}
                />
                <label htmlFor="mental">Mental Health</label>
              </div>
              <div className="referral-checkbox">
                <input
                  type="checkbox"
                  id="other"
                  checked={formData.referrals.other}
                  onChange={handleCheckboxChange('other')}
                />
                <label htmlFor="other">Other</label>
              </div>
            </div>
            <div className="remarks-row">
              <input
                type="text"
                className="remarks-input"
                placeholder="Additional notes or remarks..."
                value={formData.remarks}
                onChange={handleInputChange('remarks')}
              />
            </div>
          </div>
        </div>

        {/* Text Areas Grid */}
        <div className="text-areas-grid">
          <div className="grid-column">
            <div className="form-section">
              <div className="section-header">
                <h3>Clinical Observations</h3>
              </div>
              <textarea 
                className="text-area"
                placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
                value={formData.clinicalObservations}
                onChange={handleInputChange('clinicalObservations')}
              />
            </div>
            <div className="form-section">
              <div className="section-header">
                <h3>Priority Support Areas</h3>
              </div>
              <textarea 
                className="text-area"
                placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
                value={formData.priorityAreas}
                onChange={handleInputChange('priorityAreas')}
              />
            </div>
          </div>
          <div className="grid-column">
            <div className="form-section">
              <div className="section-header">
                <h3>Strengths & Abilities</h3>
              </div>
              <textarea 
                className="text-area"
                placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
                value={formData.strengths}
                onChange={handleInputChange('strengths')}
              />
            </div>
            <div className="form-section">
              <div className="section-header">
                <h3>Support Recommendations</h3>
              </div>
              <textarea 
                className="text-area"
                placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
                value={formData.recommendations}
                onChange={handleInputChange('recommendations')}
              />
            </div>
          </div>
        </div>

        <div className="button-group">
          <button className="clear-button" onClick={handleClear}>
            Clear Form
          </button>
          <button 
            className="submit-button"
            onClick={() => handleStatusChange('submitted')}
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
}; 