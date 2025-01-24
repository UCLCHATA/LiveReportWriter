import React from 'react';
import styles from './SubmissionOverlay.module.css';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export type Stage = 'submission' | 'waiting' | 'complete' | 'error';

export interface SubmissionDetails {
  documentUrl?: string;
  emailStatus?: string;
  errorMessage?: string;
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
        return (
          <div className={styles.stageMessage}>
            <div className={styles.spinner}></div>
            <p>Submitting form data...</p>
          </div>
        );
      case 'waiting':
        return (
          <div className={styles.stageMessage}>
            <div className={styles.spinner}></div>
            <p>Waiting for data sync...</p>
          </div>
        );
      case 'complete':
        return (
          <div className={`${styles.successMessage} ${styles.notification}`}>
            <CheckCircle size={48} className={styles.icon} />
            <h3>Form Submitted Successfully!</h3>
            <p>Your data has been saved and your report is now being generated.</p>
            <p>You will receive your report via email within 10 minutes.</p>
            <p className={styles.note}>
              If you do not receive your report, please contact{' '}
              <a href="mailto:uclchata@gmail.com">uclchata@gmail.com</a>
            </p>
            <button onClick={onClose} className={styles.clearButton}>
              Clear Form to Create Another Report
            </button>
          </div>
        );
      case 'error':
        return (
          <div className={`${styles.errorMessage} ${styles.notification}`}>
            <AlertCircle size={48} className={styles.icon} />
            <h3>Submission Error</h3>
            <p>{details?.errorMessage || 'An error occurred during submission.'}</p>
            <button className={styles.retryButton} onClick={onClose}>
              Try Again
            </button>
          </div>
        );
      default:
        return '';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {onClose && currentStage !== 'error' && currentStage !== 'complete' && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        )}
        {(currentStage === 'submission' || currentStage === 'waiting') && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className={styles.stage}>
          {getStageMessage(currentStage)}
        </div>
      </div>
    </div>
  );
}; 