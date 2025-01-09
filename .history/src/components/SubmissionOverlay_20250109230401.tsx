import React, { useEffect, useState } from 'react';
import styles from './SubmissionOverlay.module.css';

interface SubmissionOverlayProps {
  isVisible: boolean;
  currentStage: 'submission' | 'waiting' | 'template' | 'analysis' | 'report' | 'email' | 'error';
  progress: number;
  details?: {
    documentUrl?: string;
    emailStatus?: string;
  };
  onClose?: () => void;
}

const stageConfig = {
  submission: { label: 'Submitting form data...', icon: '📝' },
  waiting: { label: 'Verifying data submission...', icon: '⏳' },
  template: { label: 'Preparing template...', icon: '📋' },
  analysis: { label: 'Analyzing data...', icon: '🔍' },
  report: { label: 'Generating report...', icon: '📊' },
  email: { label: 'Process completed', icon: '✅' },
  error: { label: 'Error occurred', icon: '❌' }
};

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  isVisible,
  currentStage,
  progress,
  details,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState(180);
  const stages = ['submission', 'waiting', 'template', 'analysis', 'report', 'email'];
  const currentStageIndex = stages.indexOf(currentStage);

  useEffect(() => {
    if (isVisible && currentStage !== 'error' && currentStage !== 'email') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isVisible, currentStage]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Report Generation Progress</h2>
          {onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.stageIndicator}>
            <div className={styles.icon}>{stageConfig[currentStage].icon}</div>
            <div className={styles.stageLabel}>{stageConfig[currentStage].label}</div>
          </div>

          <div className={styles.progressTrack}>
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`${styles.progressNode} ${
                  index < currentStageIndex ? styles.completed :
                  index === currentStageIndex ? styles.current :
                  styles.pending
                }`}
              >
                <div className={styles.nodeContent}>
                  <span className={styles.dot} />
                  <span className={styles.label}>{stageConfig[stage].icon}</span>
                </div>
                {index < stages.length - 1 && <div className={styles.connector} />}
              </div>
            ))}
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
              data-progress={progress === 100 ? 'complete' : ''}
            >
              <span className={styles.progressText}>{progress}%</span>
            </div>
          </div>

          {currentStage !== 'error' && currentStage !== 'email' && (
            <div className={styles.timer}>
              Estimated time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}

          {details && (
            <div className={styles.details}>
              {details.documentUrl && (
                <a
                  href={details.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.documentLink}
                >
                  View Generated Document
                </a>
              )}
              {details.emailStatus && (
                <div className={styles.emailStatus}>
                  {details.emailStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 