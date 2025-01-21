import React, { useEffect } from 'react';
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
import styles from './AssessmentForm.module.css';

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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    updateFormData({
      referrals: {
        ...formData.referrals,
        [field]: checked
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
    <div className={styles['form-container']}>
      <div className={styles['form-content']}>
        <div className={styles['combined-section']}>
          <div className={styles['status-group']}>
            <div className={styles['status-item']}>
              <h4>ASC Status</h4>
              <select value={formData.ascStatus} onChange={handleInputChange('ascStatus')}>
                <option value="">Select status</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="unlikely">Unlikely</option>
              </select>
            </div>
            <div className={styles['status-item']}>
              <h4>ADHD Status</h4>
              <select value={formData.adhdStatus} onChange={handleInputChange('adhdStatus')}>
                <option value="">Select status</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="unlikely">Unlikely</option>
              </select>
            </div>
          </div>
          
          <div className={styles['referrals-section']}>
            <h4>Referrals</h4>
            <div className={styles['referrals-grid']}>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="speech"
                  checked={formData.referrals.speech}
                  onChange={(e) => handleCheckboxChange('speech', e.target.checked)}
                />
                <label htmlFor="speech">Speech & Language</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="educational"
                  checked={formData.referrals.educational}
                  onChange={(e) => handleCheckboxChange('educational', e.target.checked)}
                />
                <label htmlFor="educational">Educational Psychology</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="sleep"
                  checked={formData.referrals.sleep}
                  onChange={(e) => handleCheckboxChange('sleep', e.target.checked)}
                />
                <label htmlFor="sleep">Sleep Support</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="occupational"
                  checked={formData.referrals.occupational}
                  onChange={(e) => handleCheckboxChange('occupational', e.target.checked)}
                />
                <label htmlFor="occupational">Occupational Therapy</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="mental"
                  checked={formData.referrals.mental}
                  onChange={(e) => handleCheckboxChange('mental', e.target.checked)}
                />
                <label htmlFor="mental">Mental Health</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="other"
                  checked={formData.referrals.other}
                  onChange={(e) => handleCheckboxChange('other', e.target.checked)}
                />
                <label htmlFor="other">Other</label>
              </div>
            </div>
            <div className={styles['remarks-row']}>
              <input
                type="text"
                className={styles['remarks-input']}
                placeholder="Additional remarks..."
                value={formData.referralRemarks}
                onChange={handleInputChange('referralRemarks')}
              />
            </div>
          </div>
        </div>

        <div className={styles['text-areas-grid']}>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Clinical observations..."
              value={formData.clinicalObservations}
              onChange={handleInputChange('clinicalObservations')}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Priority areas..."
              value={formData.priorityAreas}
              onChange={handleInputChange('priorityAreas')}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Strengths..."
              value={formData.strengths}
              onChange={handleInputChange('strengths')}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Recommendations..."
              value={formData.recommendations}
              onChange={handleInputChange('recommendations')}
            />
          </div>
        </div>

        <div className={styles['button-group']}>
          <button
            type="button"
            className="secondary-button"
            onClick={handleClear}
          >
            Clear Form
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => handleStatusChange('submitted')}
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
}; 