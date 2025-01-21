import React, { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { ClinicianInfo } from '../types';
import styles from './ClinicianModal.module.css';

interface ClinicianModalProps {
  isOpen: boolean;
  onSubmit: (info: ClinicianInfo) => void;
  onCancel: () => void;
}

export const ClinicianModal: React.FC<ClinicianModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const { checkExistingDraft, restoreDraft } = useFormContext();
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo>({
    name: '',
    email: '',
  });
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{
    lastSaved?: string;
    clinicianName?: string;
  }>({});

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setClinicianInfo(prev => ({ ...prev, email }));
    
    // Check for existing draft when email is entered
    if (email) {
      const draft = checkExistingDraft(email);
      if (draft.exists) {
        setDraftInfo({
          lastSaved: draft.lastSaved,
          clinicianName: draft.clinicianName
        });
        setShowDraftAlert(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email) {
      const draft = checkExistingDraft(clinicianInfo.email);
      if (draft.exists) {
        setShowDraftAlert(true);
        return;
      }
      onSubmit(clinicianInfo);
    }
  };

  const handleRestoreDraft = () => {
    if (clinicianInfo.email) {
      const restored = restoreDraft(clinicianInfo.email);
      if (restored) {
        onSubmit(restored.clinician);
      }
    }
    setShowDraftAlert(false);
  };

  const handleStartNew = () => {
    setShowDraftAlert(false);
    onSubmit(clinicianInfo);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Enter Clinician Details</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="clinician-name">Name</label>
              <input
                id="clinician-name"
                type="text"
                value={clinicianInfo.name}
                onChange={(e) =>
                  setClinicianInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="clinician-email">Email</label>
              <input
                id="clinician-email"
                type="email"
                value={clinicianInfo.email}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton}>
                Start Assessment
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDraftAlert && (
        <div className={styles.modalOverlay}>
          <div className={styles.alertContent}>
            <h3>Existing Draft Found</h3>
            <p>
              We found an unsubmitted assessment form for {draftInfo.clinicianName} 
              (last saved {new Date(draftInfo.lastSaved || '').toLocaleString()})
            </p>
            <div className={styles.buttonGroup}>
              <button 
                onClick={handleStartNew}
                className={styles.secondaryButton}
              >
                Start New
              </button>
              <button 
                onClick={handleRestoreDraft}
                className={styles.primaryButton}
              >
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 