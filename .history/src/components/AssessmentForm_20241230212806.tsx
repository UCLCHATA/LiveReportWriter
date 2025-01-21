import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import styles from './AssessmentForm.module.css';

interface AssessmentFormProps {
  onClear: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear }) => {
  const { state, updateFormData } = useFormContext();
  const { assessmentData } = state;

  const handleInputChange = (field: keyof typeof assessmentData) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>
  ) => {
    updateFormData({
      assessmentData: {
        ...assessmentData,
        [field]: e.target.value
      }
    });
  };

  const handleReferralChange = (field: keyof typeof assessmentData.referrals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateFormData({
      assessmentData: {
        ...assessmentData,
        referrals: {
          ...assessmentData.referrals,
          [field]: e.target.checked
        }
      }
    });
  };

  const handleStatusChange = (field: keyof typeof assessmentData.status) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateFormData({
      assessmentData: {
        ...assessmentData,
        status: {
          ...assessmentData.status,
          [field]: e.target.value
        }
      }
    });
  };

  const handleClearForm = () => {
    onClear();
  };

  const handleSubmit = () => {
    updateFormData({
      formStatus: {
        ...state.formStatus,
        isDraft: false
      }
    });
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.combinedSection}>
        <div className={styles.sectionHeader}>
          <i className="material-icons">check_circle</i>
          <h3>Status & Referrals</h3>
        </div>
        <div className={styles.statusGroup}>
          <div className={styles.formGroup}>
            <label>ASC Status</label>
            <select
              value={assessmentData.status.asc}
              onChange={handleStatusChange('asc')}
            >
              <option value="">--</option>
              <option value="confirmed">Confirmed</option>
              <option value="suspected">Suspected</option>
              <option value="ruled-out">Ruled Out</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>ADHD Status</label>
            <select
              value={assessmentData.status.adhd}
              onChange={handleStatusChange('adhd')}
            >
              <option value="">--</option>
              <option value="confirmed">Confirmed</option>
              <option value="suspected">Suspected</option>
              <option value="ruled-out">Ruled Out</option>
            </select>
          </div>
        </div>
        <div className={styles.referralsGrid}>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="speech"
              checked={assessmentData.referrals.speech}
              onChange={handleReferralChange('speech')}
            />
            <label htmlFor="speech">Speech & Language</label>
          </div>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="educational"
              checked={assessmentData.referrals.educational}
              onChange={handleReferralChange('educational')}
            />
            <label htmlFor="educational">Educational Psychology</label>
          </div>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="sleep"
              checked={assessmentData.referrals.sleep}
              onChange={handleReferralChange('sleep')}
            />
            <label htmlFor="sleep">Sleep Support</label>
          </div>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="occupational"
              checked={assessmentData.referrals.occupational}
              onChange={handleReferralChange('occupational')}
            />
            <label htmlFor="occupational">Occupational Therapy</label>
          </div>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="mental"
              checked={assessmentData.referrals.mental}
              onChange={handleReferralChange('mental')}
            />
            <label htmlFor="mental">Mental Health</label>
          </div>
          <div className={styles.referralCheckbox}>
            <input
              type="checkbox"
              id="other"
              checked={assessmentData.referrals.other}
              onChange={handleReferralChange('other')}
            />
            <label htmlFor="other">Other</label>
          </div>
        </div>
        <div className={styles.remarksRow}>
          <input
            type="text"
            className={styles.remarksInput}
            placeholder="Additional notes or remarks..."
            value={assessmentData.remarks}
            onChange={handleInputChange('remarks')}
          />
        </div>
      </div>

      <div className={styles.textAreasGrid}>
        <div className={styles.gridColumn}>
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <i className="material-icons">description</i>
              <h3>Key Clinical Observations</h3>
            </div>
            <textarea 
              className={styles.textArea}
              placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
              value={assessmentData.clinicalObservations}
              onChange={handleInputChange('clinicalObservations')}
            />
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <i className="material-icons">priority_high</i>
              <h3>Priority Support Areas</h3>
            </div>
            <textarea 
              className={styles.textArea}
              placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
              value={assessmentData.priorityAreas}
              onChange={handleInputChange('priorityAreas')}
            />
          </div>
        </div>

        <div className={styles.gridColumn}>
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <i className="material-icons">star</i>
              <h3>Strengths & Abilities</h3>
            </div>
            <textarea 
              className={styles.textArea}
              placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
              value={assessmentData.strengths}
              onChange={handleInputChange('strengths')}
            />
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <i className="material-icons">lightbulb</i>
              <h3>Support Recommendations</h3>
            </div>
            <textarea 
              className={styles.textArea}
              placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
              value={assessmentData.recommendations}
              onChange={handleInputChange('recommendations')}
            />
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.clearButton} onClick={handleClearForm}>
          Clear Form
        </button>
        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit Assessment
        </button>
      </div>

      {state.formStatus.isAutosaved && (
        <div className={styles.autosaveIndicator}>
          Last saved {new Date(state.formStatus.lastSaved).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}; 