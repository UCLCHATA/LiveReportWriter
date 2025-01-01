import React, { useEffect } from 'react';
import { useFormState } from '../hooks/useFormState';
import styles from './Form.module.css';

type AssessmentFormProps = {
  onClear: () => void;
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear }) => {
  const { globalState, updateFormData, clearState } = useFormState();
  const formData = globalState.formData;

  // If formData is not initialized, show loading or redirect to clinician modal
  if (!formData) {
    return null;
  }

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
    <div className={styles.formContainer}>
      <div className={styles.formContent}>
        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Status & Referrals</h3>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>ASC Status</label>
            <select 
              className={styles.select}
              value={formData.ascStatus} 
              onChange={handleInputChange('ascStatus')}
            >
              <option value="">--</option>
              <option value="confirmed">Confirmed</option>
              <option value="suspected">Suspected</option>
              <option value="ruled-out">Ruled Out</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>ADHD Status</label>
            <select 
              className={styles.select}
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

        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Referrals</h3>
          </div>
          <div className={styles.formGroup}>
            <div>
              <input
                type="checkbox"
                id="speech"
                checked={formData.referrals.speech}
                onChange={handleCheckboxChange('speech')}
              />
              <label htmlFor="speech">Speech & Language</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="educational"
                checked={formData.referrals.educational}
                onChange={handleCheckboxChange('educational')}
              />
              <label htmlFor="educational">Educational Psychology</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="sleep"
                checked={formData.referrals.sleep}
                onChange={handleCheckboxChange('sleep')}
              />
              <label htmlFor="sleep">Sleep Support</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="occupational"
                checked={formData.referrals.occupational}
                onChange={handleCheckboxChange('occupational')}
              />
              <label htmlFor="occupational">Occupational Therapy</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="mental"
                checked={formData.referrals.mental}
                onChange={handleCheckboxChange('mental')}
              />
              <label htmlFor="mental">Mental Health</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="other"
                checked={formData.referrals.other}
                onChange={handleCheckboxChange('other')}
              />
              <label htmlFor="other">Other</label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Additional notes or remarks..."
              value={formData.remarks}
              onChange={handleInputChange('remarks')}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Clinical Observations</h3>
          </div>
          <textarea 
            className={styles.textarea}
            placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
            value={formData.clinicalObservations}
            onChange={handleInputChange('clinicalObservations')}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Priority Support Areas</h3>
          </div>
          <textarea 
            className={styles.textarea}
            placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
            value={formData.priorityAreas}
            onChange={handleInputChange('priorityAreas')}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Strengths & Abilities</h3>
          </div>
          <textarea 
            className={styles.textarea}
            placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
            value={formData.strengths}
            onChange={handleInputChange('strengths')}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Support Recommendations</h3>
          </div>
          <textarea 
            className={styles.textarea}
            placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
            value={formData.recommendations}
            onChange={handleInputChange('recommendations')}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleClear}>
            Clear Form
          </button>
          <button 
            className={styles.submitButton}
            onClick={() => handleStatusChange('submitted')}
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
}; 