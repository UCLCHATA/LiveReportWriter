import React from 'react';
import styles from './SubmissionOverlay.module.css';
import { X } from 'lucide-react';

export type Stage = 'submission' | 'waiting' | 'complete' | 'error';

export interface SubmissionDetails {
  documentUrl?: string;
  emailStatus?: string;
}

interface SubmissionOverlayProps {
  isVisible: boolean;
  currentStage: Stage;
  progress: number;
  details?: SubmissionDetails;
  onClose?: () => void;
}

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  isVisible,
  currentStage,
  progress,
  details,
  onClose
}) => {
  if (!isVisible) return null;

  const getStageMessage = (stage: Stage) => {
    switch (stage) {
      case 'submission':
        return 'Submitting form data...';
      case 'waiting':
        return 'Waiting for data sync...';
      case 'complete':
        return (
          <div className={styles.successMessage}>
            <h3>Form Submitted Successfully!</h3>
            <p>Your data has been saved and your report is now being generated.</p>
            <p>You will receive your report via email within 10 minutes.</p>
            <p className={styles.note}>If you do not receive your report, please contact <a href="mailto:uclchata@gmail.com">uclchata@gmail.com</a></p>
            <button onClick={onClose} className={styles.clearButton}>
              Clear Form to Create Another Report
            </button>
          </div>
        );
      case 'error':
        return 'An error occurred during submission. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        )}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.stage}>
          {getStageMessage(currentStage)}
        </div>
        {currentStage === 'error' && onClose && (
          <button className={styles.retryButton} onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}; 