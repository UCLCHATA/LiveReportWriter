import React, { useState, useRef } from 'react';
import { Microscope, Dumbbell, AlertTriangle, ThumbsUp } from 'lucide-react';
import styles from './Form.module.css';

interface AssessmentFormProps {
  onSubmit: (data: FormData) => void;
  onClear: () => void;
}

interface FormData {
  clinicalObservations: string;
  strengthsAbilities: string;
  prioritySupport: string;
  supportRecommendations: string;
  status: string;
  referrals: string;
}

const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const getTextLengthStatus = (wordCount: number) => {
  if (wordCount >= 300) return { text: 'Adequate', color: '#22c55e' };
  if (wordCount >= 200) return { text: 'Minimal', color: '#eab308' };
  return { text: 'Inadequate', color: '#ef4444' };
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, onClear }) => {
  const [formData, setFormData] = useState<FormData>({
    clinicalObservations: '',
    strengthsAbilities: '',
    prioritySupport: '',
    supportRecommendations: '',
    status: '',
    referrals: ''
  });

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const cursorPosition = target.selectionStart;
      const currentValue = target.value;
      const newValue = currentValue.slice(0, cursorPosition) + '\n• ' + currentValue.slice(cursorPosition);
      const field = target.name as keyof FormData;
      setFormData(prev => ({ ...prev, [field]: newValue }));
      // Set cursor position after bullet point
      setTimeout(() => {
        target.selectionStart = cursorPosition + 3;
        target.selectionEnd = cursorPosition + 3;
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClear = () => {
    setFormData({
      clinicalObservations: '',
      strengthsAbilities: '',
      prioritySupport: '',
      supportRecommendations: '',
      status: '',
      referrals: ''
    });
    onClear();
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formContent}>
        <div className={styles.textAreasGrid}>
          <div className={styles.gridColumn}>
            <div className={styles.textAreaContainer} style={{ borderColor: '#22c55e' }}>
              <div className={styles.textAreaHeader}>
                <Microscope className={styles.textAreaIcon} />
                <span className={styles.textAreaLabel}>Clinical Observations</span>
              </div>
              <textarea
                name="clinicalObservations"
                value={formData.clinicalObservations}
                onChange={handleChange('clinicalObservations')}
                onKeyDown={handleKeyDown}
                className={styles.textArea}
                placeholder="Enter clinical observations..."
              />
              <div className={styles.textLengthIndicator}>
                {getTextLengthStatus(getWordCount(formData.clinicalObservations)).text}
              </div>
            </div>
            <div className={styles.textAreaContainer} style={{ borderColor: '#eab308' }}>
              <div className={styles.textAreaHeader}>
                <Dumbbell className={styles.textAreaIcon} />
                <span className={styles.textAreaLabel}>Strengths & Abilities</span>
              </div>
              <textarea
                name="strengthsAbilities"
                value={formData.strengthsAbilities}
                onChange={handleChange('strengthsAbilities')}
                onKeyDown={handleKeyDown}
                className={styles.textArea}
                placeholder="Enter strengths and abilities..."
              />
              <div className={styles.textLengthIndicator}>
                {getTextLengthStatus(getWordCount(formData.strengthsAbilities)).text}
              </div>
            </div>
          </div>
          <div className={styles.gridColumn}>
            <div className={styles.textAreaContainer} style={{ borderColor: '#ef4444' }}>
              <div className={styles.textAreaHeader}>
                <AlertTriangle className={styles.textAreaIcon} />
                <span className={styles.textAreaLabel}>Priority Support Areas</span>
              </div>
              <textarea
                name="prioritySupport"
                value={formData.prioritySupport}
                onChange={handleChange('prioritySupport')}
                onKeyDown={handleKeyDown}
                className={styles.textArea}
                placeholder="Enter priority support areas..."
              />
              <div className={styles.textLengthIndicator}>
                {getTextLengthStatus(getWordCount(formData.prioritySupport)).text}
              </div>
            </div>
            <div className={styles.textAreaContainer} style={{ borderColor: '#8b5cf6' }}>
              <div className={styles.textAreaHeader}>
                <ThumbsUp className={styles.textAreaIcon} />
                <span className={styles.textAreaLabel}>Support Recommendations</span>
              </div>
              <textarea
                name="supportRecommendations"
                value={formData.supportRecommendations}
                onChange={handleChange('supportRecommendations')}
                onKeyDown={handleKeyDown}
                className={styles.textArea}
                placeholder="Enter support recommendations..."
              />
              <div className={styles.textLengthIndicator}>
                {getTextLengthStatus(getWordCount(formData.supportRecommendations)).text}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statusSection}>
          <div className={styles.statusGroup}>
            <div className={styles.statusItem}>
              <label className={styles.statusLabel}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange('status')}
                className={styles.statusSelect}
              >
                <option value="">Select status...</option>
                <option value="draft">Draft</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.statusItem}>
              <label className={styles.statusLabel}>Referrals</label>
              <select
                name="referrals"
                value={formData.referrals}
                onChange={handleChange('referrals')}
                className={styles.statusSelect}
              >
                <option value="">Select referrals...</option>
                <option value="none">None</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Submit Assessment
          </button>
          <button type="button" onClick={handleClear} className={styles.clearButton}>
            Clear Form
          </button>
        </div>
      </div>
    </form>
  );
}; 