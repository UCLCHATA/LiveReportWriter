import React, { useState } from 'react';
import { useFormState } from '../hooks/useFormState';
import styles from './Modal.module.css';

type ClinicianInfo = {
  name: string;
  email: string;
};

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
  const { checkExistingDraft, restoreDraft } = useFormState();
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo>({
    name: '',
    email: '',
  });
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email) {
      const existingDraft = checkExistingDraft(clinicianInfo.email);
      if (existingDraft) {
        setShowDraftAlert(true);
        return;
      }
      onSubmit(clinicianInfo);
    }
  };

  const handleRestoreDraft = () => {
    const restored = restoreDraft(clinicianInfo.email);
    if (restored) {
      onSubmit(clinicianInfo);
    }
    setShowDraftAlert(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Clinician Information</h2>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={clinicianInfo.name}
              onChange={(e) =>
                setClinicianInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          
          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={clinicianInfo.email}
              onChange={(e) =>
                setClinicianInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          
          <div className={styles['button-group']}>
            <button
              type="button"
              className={`${styles.button} ${styles['cancel-button']}`}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles['submit-button']}`}
            >
              Start Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 