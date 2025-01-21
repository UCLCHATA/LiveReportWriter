import React from 'react';
import styles from './AssessmentForm.module.css';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ValidationItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  validationItems: ValidationItem[];
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  validationItems
}) => {
  if (!isOpen) return null;

  const allCompleted = validationItems.every(item => item.completed);
  const completedCount = validationItems.filter(item => item.completed).length;

  const getEncouragementText = () => {
    if (allCompleted) {
      return "Great job! All requirements are met. You can now submit the assessment.";
    }
    if (completedCount === 0) {
      return "Let's work through these requirements together.";
    }
    if (completedCount > validationItems.length / 2) {
      return `Almost there! Just ${validationItems.length - completedCount} more ${validationItems.length - completedCount === 1 ? 'item' : 'items'} to go.`;
    }
    return "You're making progress! Keep going.";
  };

  return (
    <div className={styles.modal}>
      <div className={styles.validationDialog}>
        <h2 className={styles.validationTitle}>
          {allCompleted ? (
            <CheckCircle className={styles.titleIcon} />
          ) : (
            <AlertCircle className={styles.titleIcon} />
          )}
          Submission Requirements
        </h2>

        <div className={styles.checklistContainer}>
          {validationItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.checklistItem} ${
                item.completed ? styles.completed : styles.pending
              }`}
            >
              <span className={styles.checkIcon}>
                {item.completed ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
              </span>
              <span className={styles.checklistText}>{item.label}</span>
            </div>
          ))}
        </div>

        <p className={styles.encouragementText}>
          {getEncouragementText()}
        </p>

        <div className={styles.validationActions}>
          <button
            className={`${styles.validationButton} ${styles.secondaryButton}`}
            onClick={onClose}
          >
            Continue Editing
          </button>
          {allCompleted && (
            <button
              className={`${styles.validationButton} ${styles.primaryButton}`}
              onClick={onContinue}
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 