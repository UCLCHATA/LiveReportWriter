import React, { useState } from 'react';
import { ChataIdInput } from './ChataIdInput';
import { formPersistence } from '../services/formPersistence';
import styles from './ClinicianModal.module.css';

interface ClinicianModalProps {
  isOpen: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onChataIdDialogChange: (isOpen: boolean) => void;
}

export const ClinicianModal: React.FC<ClinicianModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  onChataIdDialogChange
}) => {
  const [showRetrieval, setShowRetrieval] = useState(false);
  const [retrievalChataId, setRetrievalChataId] = useState('');
  const [retrievalError, setRetrievalError] = useState('');

  const handleRetrievalAttempt = () => {
    const existingForm = formPersistence.getForm(retrievalChataId);
    if (existingForm) {
      onSubmit(existingForm);
      setShowRetrieval(false);
      setRetrievalError('');
    } else {
      setRetrievalError('No existing form found for this CHATA ID');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {!showRetrieval ? (
          <>
            <h2>New Assessment</h2>
            {/* Existing form content */}
            <div className={styles.retrievalSection}>
              <button 
                className={styles.retrievalButton}
                onClick={() => setShowRetrieval(true)}
              >
                Retrieve Existing Form
              </button>
            </div>
          </>
        ) : (
          <div className={styles.retrievalOverlay}>
            <h2>Retrieve Existing Form</h2>
            <p>Enter the CHATA ID to retrieve an existing form:</p>
            <ChataIdInput
              onChange={setRetrievalChataId}
              onSubmit={handleRetrievalAttempt}
            />
            {retrievalError && (
              <div className={styles.errorMessage}>{retrievalError}</div>
            )}
            <div className={styles.buttonGroup}>
              <button 
                className={styles.secondaryButton}
                onClick={() => {
                  setShowRetrieval(false);
                  setRetrievalError('');
                }}
              >
                Back
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleRetrievalAttempt}
                disabled={!retrievalChataId}
              >
                Retrieve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 