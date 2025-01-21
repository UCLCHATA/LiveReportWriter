import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import styles from '../styles/main.css';

interface ValidationItem {
  id: string;
  label: string;
  isComplete: boolean;
}

interface ValidationDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onProceed: () => void;
  validationItems: ValidationItem[];
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  isVisible,
  onClose,
  onProceed,
  validationItems
}) => {
  if (!isVisible) return null;

  const allComplete = validationItems.every(item => item.isComplete);
  const completedCount = validationItems.filter(item => item.isComplete).length;
  const totalCount = validationItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const getEncouragementText = () => {
    if (allComplete) {
      return "Great job! All requirements are met. You can proceed with the submission.";
    }
    if (completionPercentage >= 75) {
      return "Almost there! Just a few more items to complete.";
    }
    if (completionPercentage >= 50) {
      return "You're making good progress. Keep going!";
    }
    return "Let's work on completing these requirements before submitting.";
  };

  return (
    <>
      <div className={styles.validationOverlay} />
      <div className={styles.validationDialog}>
        <h2>Form Submission Checklist</h2>
        
        <ul className={styles.validationChecklist}>
          {validationItems.map(item => (
            <li 
              key={item.id}
              className={`${styles.validationItem} ${
                item.isComplete ? styles.complete : styles.incomplete
              }`}
            >
              {item.isComplete ? (
                <CheckCircle className={`${styles.validationIcon} ${styles.complete}`} size={20} />
              ) : (
                <XCircle className={`${styles.validationIcon} ${styles.incomplete}`} size={20} />
              )}
              <span className={`${styles.validationText} ${
                item.isComplete ? styles.complete : styles.incomplete
              }`}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.encouragementText}>
          {getEncouragementText()}
        </p>

        <div className={styles.validationButtons}>
          <button 
            onClick={onClose}
            className={`${styles.validationButton} ${styles.secondary}`}
          >
            Go Back
          </button>
          <button
            onClick={onProceed}
            className={`${styles.validationButton} ${styles.primary}`}
            disabled={!allComplete}
            style={{ opacity: allComplete ? 1 : 0.5, cursor: allComplete ? 'pointer' : 'not-allowed' }}
          >
            {allComplete ? 'Proceed' : 'Complete All Items'}
          </button>
        </div>
      </div>
    </>
  );
}; 