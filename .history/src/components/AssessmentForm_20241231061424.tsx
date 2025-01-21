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
    <div className={styles['form-container']}>
      <div className={styles['form-content']}>
        <div className={styles['combined-section']}>
          <div className={styles['status-group']}>
            <div className={styles['status-item']}>
              <h4>ASC Status</h4>
              <select value={formData.ascStatus} onChange={(e) => handleInputChange('ascStatus', e.target.value)}>
                <option value="">--</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="ruled-out">Ruled Out</option>
              </select>
            </div>
            <div className={styles['status-item']}>
              <h4>ADHD Status</h4>
              <select value={formData.adhdStatus} onChange={(e) => handleInputChange('adhdStatus', e.target.value)}>
                <option value="">--</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="ruled-out">Ruled Out</option>
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
                  onChange={handleCheckboxChange('speech')}
                />
                <label htmlFor="speech">Speech & Language</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="educational"
                  checked={formData.referrals.educational}
                  onChange={handleCheckboxChange('educational')}
                />
                <label htmlFor="educational">Educational Psychology</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="sleep"
                  checked={formData.referrals.sleep}
                  onChange={handleCheckboxChange('sleep')}
                />
                <label htmlFor="sleep">Sleep Support</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="occupational"
                  checked={formData.referrals.occupational}
                  onChange={handleCheckboxChange('occupational')}
                />
                <label htmlFor="occupational">Occupational Therapy</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="mental"
                  checked={formData.referrals.mental}
                  onChange={handleCheckboxChange('mental')}
                />
                <label htmlFor="mental">Mental Health</label>
              </div>
              <div className={styles['referral-checkbox']}>
                <input
                  type="checkbox"
                  id="other"
                  checked={formData.referrals.other}
                  onChange={handleCheckboxChange('other')}
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
                onChange={(e) => handleInputChange('referralRemarks', e.target.value)}
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
              onChange={(e) => handleInputChange('clinicalObservations', e.target.value)}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Priority areas..."
              value={formData.priorityAreas}
              onChange={(e) => handleInputChange('priorityAreas', e.target.value)}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Strengths..."
              value={formData.strengths}
              onChange={(e) => handleInputChange('strengths', e.target.value)}
            />
          </div>
          <div className={styles['form-section']}>
            <textarea
              className={styles['text-area']}
              placeholder="Recommendations..."
              value={formData.recommendations}
              onChange={(e) => handleInputChange('recommendations', e.target.value)}
            />
          </div>
        </div>

        <div className={styles['button-group']}>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}; 