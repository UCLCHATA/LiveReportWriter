import React from 'react';
import styles from './SubmissionOverlay.module.css';
import { X, CheckCircle, AlertCircle, Clock, Share2 } from 'lucide-react';

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
            <p className={styles.processingText}>Processing your assessment...</p>
          </div>
        );
      case 'waiting':
        return (
          <div className={styles.stageMessage}>
            <div className={styles.spinner}></div>
            <p className={styles.processingText}>Almost there! Finalizing your report...</p>
          </div>
        );
      case 'complete':
        return (
          <div className={`${styles.successMessage} ${styles.notification}`}>
            <div className={styles.celebrationWrapper}>
              <CheckCircle size={48} className={`${styles.icon} ${styles.successIcon}`} />
              <div className={styles.confetti}></div>
            </div>
            <h3 className={styles.bounceIn}>Amazing Work!</h3>
            <div className={styles.messageContainer}>
              <p className={styles.fadeInUp}>Your comprehensive assessment has been saved successfully! 🎉</p>
              <div className={styles.timeEstimate}>
                <Clock size={20} className={styles.clockIcon} />
                <p>Your detailed report will arrive in your inbox within 10 minutes</p>
              </div>
              <div className={styles.savingsMessage}>
                <p className={styles.highlight}>You just saved 45+ minutes of documentation time!</p>
              </div>
              <div className={styles.shareSection}>
                <p className={styles.sharePrompt}>
                  Know other clinicians who could save time with CHATA?
                </p>
                <button className={styles.shareButton}>
                  <Share2 size={20} />
                  Share CHATA
                </button>
              </div>
              <p className={styles.note}>
                Haven't received your report? Contact{' '}
                <a href="mailto:uclchata@gmail.com">uclchata@gmail.com</a>
              </p>
            </div>
            <button onClick={onClose} className={`${styles.clearButton} ${styles.pulseButton}`}>
              Create Another Assessment
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
      <div className={`${styles.content} ${styles.slideUp}`}>
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