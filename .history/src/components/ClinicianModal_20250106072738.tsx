import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';
import { ChataIdInput } from './ChataIdInput';

type ClinicianInfo = {
  name: string;
  email: string;
  clinicName: string;
  childName: string;
  childAge: string;
  childGender: string;
  chataId?: string;
};

interface ClinicianModalProps {
  isOpen: boolean;
  onSubmit: (info: ClinicianInfo) => void;
  onCancel: () => void;
  onChataIdDialogChange?: (isOpen: boolean) => void;
}

export const ClinicianModal: React.FC<ClinicianModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  onChataIdDialogChange
}) => {
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo>({
    name: '',
    email: '',
    clinicName: '',
    childName: '',
    childAge: '',
    childGender: '',
  });
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [showRetrieval, setShowRetrieval] = useState(false);
  const [retrievalChataId, setRetrievalChataId] = useState('');
  const [retrievalError, setRetrievalError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const ageOptions = useMemo(() => generateAgeOptions(), []);

  const handleRetrievalAttempt = () => {
    const existingForm = formPersistence.getForm(retrievalChataId);
    if (existingForm) {
      if (existingForm.clinicianInfo) {
        onSubmit(existingForm.clinicianInfo);
        setShowRetrieval(false);
        setRetrievalError('');
      }
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
            <button 
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="Close"
            >
              ×
            </button>
            <h2>Enter Assessment Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.buttonGroup}>
                <button type="button" className={styles.cancelButton} onClick={onCancel}>
                  Cancel
                </button>
                <button 
                  type="button"
                  className={styles.retrievalButton}
                  onClick={() => setShowRetrieval(true)}
                >
                  Retrieve Existing Form
                </button>
                <button type="submit" className={styles.submitButton}>
                  Start Assessment
                </button>
              </div>
            </form>
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