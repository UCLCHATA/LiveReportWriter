import React, { useEffect, useMemo } from 'react';
import { useFormState } from '../hooks/useFormState';
import { 
  ClipboardList, 
  Activity, 
  Users, 
  Star, 
  Lightbulb,
  MessageSquare,
  Zap,
  Award
} from 'lucide-react';
import styles from './Form.module.css';

type AssessmentFormProps = {
  onClear: () => void;
};

const getTextLengthStatus = (text: string) => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) return 'inadequate';
  if (wordCount < 50) return 'minimal';
  return 'adequate';
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
    <div className={`${styles.formContainer} ${styles.active}`}>
      <div className={styles.formContent}>
        {/* Status & Referrals Section */}
        <div className={styles.combinedSection}>
          <div className={styles.sectionHeader}>
            <ClipboardList className={styles.sectionIcon} size={18} />
            <h3>Status & Referrals</h3>
          </div>
          
          <div className={styles.statusGroup}>
            <div className={styles.formGroup}>
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
            
            <div className={styles.formGroup}>
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

          <div className={styles.referralsSection}>
            <div className={styles.sectionHeader}>
              <Users className={styles.sectionIcon} size={18} />
              <h3>Referrals</h3>
            </div>
            <div className={styles.referralsGrid}>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="speech"
                  checked={formData.referrals.speech}
                  onChange={handleCheckboxChange('speech')}
                />
                <label htmlFor="speech">Speech & Language</label>
              </div>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="educational"
                  checked={formData.referrals.educational}
                  onChange={handleCheckboxChange('educational')}
                />
                <label htmlFor="educational">Educational Psychology</label>
              </div>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="sleep"
                  checked={formData.referrals.sleep}
                  onChange={handleCheckboxChange('sleep')}
                />
                <label htmlFor="sleep">Sleep Support</label>
              </div>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="occupational"
                  checked={formData.referrals.occupational}
                  onChange={handleCheckboxChange('occupational')}
                />
                <label htmlFor="occupational">Occupational Therapy</label>
              </div>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="mental"
                  checked={formData.referrals.mental}
                  onChange={handleCheckboxChange('mental')}
                />
                <label htmlFor="mental">Mental Health</label>
              </div>
              <div className={styles.referralCheckbox}>
                <input
                  type="checkbox"
                  id="other"
                  checked={formData.referrals.other}
                  onChange={handleCheckboxChange('other')}
                />
                <label htmlFor="other">Other</label>
              </div>
            </div>
            <div className={styles.remarksRow}>
              <input
                type="text"
                className={styles.remarksInput}
                placeholder="Additional notes or remarks..."
                value={formData.remarks}
                onChange={handleInputChange('remarks')}
              />
            </div>
          </div>
        </div>

        {/* Text Areas Grid */}
        <div className={styles.textAreasGrid}>
          <div className={styles.gridColumn}>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <MessageSquare className={styles.sectionIcon} size={18} />
                <h3>Clinical Observations</h3>
              </div>
              <textarea 
                className={styles.textArea}
                style={{ minHeight: '90px' }}
                placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
                value={formData.clinicalObservations}
                onChange={handleInputChange('clinicalObservations')}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.clinicalObservations)]}`}>
                {getTextLengthStatus(formData.clinicalObservations)}
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <Zap className={styles.sectionIcon} size={18} />
                <h3>Priority Support Areas</h3>
              </div>
              <textarea 
                className={styles.textArea}
                style={{ minHeight: '90px' }}
                placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
                value={formData.priorityAreas}
                onChange={handleInputChange('priorityAreas')}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.priorityAreas)]}`}>
                {getTextLengthStatus(formData.priorityAreas)}
              </div>
            </div>
          </div>
          <div className={styles.gridColumn}>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <Star className={styles.sectionIcon} size={18} />
                <h3>Strengths & Abilities</h3>
              </div>
              <textarea 
                className={styles.textArea}
                style={{ minHeight: '90px' }}
                placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
                value={formData.strengths}
                onChange={handleInputChange('strengths')}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.strengths)]}`}>
                {getTextLengthStatus(formData.strengths)}
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <Lightbulb className={styles.sectionIcon} size={18} />
                <h3>Support Recommendations</h3>
              </div>
              <textarea 
                className={styles.textArea}
                style={{ minHeight: '90px' }}
                placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
                value={formData.recommendations}
                onChange={handleInputChange('recommendations')}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.recommendations)]}`}>
                {getTextLengthStatus(formData.recommendations)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.clearButton} onClick={handleClear}>
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