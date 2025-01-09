import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
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
  const [mode, setMode] = useState<'new' | 'restore'>('new');
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo>({
    name: '',
    email: '',
    clinicName: '',
    childName: '',
    childAge: '',
    childGender: '',
  });
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email && clinicianInfo.clinicName) {
      const existingForm = localStorage.getItem(`chata-form-${clinicianInfo.email}`);
      if (existingForm) {
        setShowDraftAlert(true);
        return;
      }

      const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName);
      setCurrentChataId(newChataId);
      
      onSubmit({ ...clinicianInfo, chataId: newChataId });
      setShowChataIdInfo(true);
      onChataIdDialogChange?.(true);
    }
  };

  const handleRetrieveClick = () => {
    setShowDraftAlert(true);
  };

  const handleRetrieveClose = () => {
    setShowDraftAlert(false);
    setChataIdInput('');
    setChataIdError('');
  };

  const handleChataIdSubmit = () => {
    if (!validateChataId(chataIdInput)) {
      setChataIdError('Invalid CHATA ID format (e.g., KV-UC-123)');
      return;
    }

    const form = localStorage.getItem(`chata-form-${chataIdInput}`);
    if (!form) {
      setChataIdError('No form found with this CHATA ID');
      return;
    }

    try {
      const parsedForm = JSON.parse(form);
      if (parsedForm.clinician) {
        const info: ClinicianInfo = {
          name: parsedForm.clinician.name,
          email: parsedForm.clinician.email,
          clinicName: parsedForm.clinician.clinicName || '',
          childName: parsedForm.clinician.childName || '',
          childAge: parsedForm.clinician.childAge || '',
          childGender: parsedForm.clinician.childGender || '',
          chataId: chataIdInput
        };
        setClinicianInfo(info);
        onSubmit(info);
        setShowDraftAlert(false);
        setChataIdError('');
      }
    } catch (error) {
      setChataIdError('Error restoring form data');
    }
  };

  const handleChataIdInfoClose = () => {
    setShowChataIdInfo(false);
    onChataIdDialogChange?.(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button 
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
          <h2>Enter Assessment Details</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Clinician Name *</label>
              <input
                type="text"
                id="name"
                value={clinicianInfo.name}
                onChange={(e) => setClinicianInfo(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={clinicianInfo.email}
                onChange={(e) => setClinicianInfo(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="clinicName">Clinic Name *</label>
              <input
                type="text"
                id="clinicName"
                value={clinicianInfo.clinicName}
                onChange={(e) => setClinicianInfo(prev => ({ ...prev, clinicName: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="childName">Child's Name</label>
              <input
                type="text"
                id="childName"
                value={clinicianInfo.childName}
                onChange={(e) => setClinicianInfo(prev => ({ ...prev, childName: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="childGender">Child's Gender</label>
              <select
                id="childGender"
                value={clinicianInfo.childGender}
                onChange={(e) => setClinicianInfo(prev => ({ ...prev, childGender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetrieveClick}
                className={`${styles.submitButton} ${styles.retrieveButton}`}
              >
                Restore Form
              </button>
              <button type="submit" className={styles.submitButton}>
                Start Assessment
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDraftAlert && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogContent}>
            <button 
              className={styles.closeButton}
              onClick={handleRetrieveClose}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Restore Form</h3>
            <p>Enter your CHATA ID to restore your form:</p>
            <ChataIdInput
              onChange={setChataIdInput}
              onSubmit={handleChataIdSubmit}
            />
            {chataIdError && <div className={styles.error}>{chataIdError}</div>}
            <div className={styles.buttonGroup}>
              <button
                onClick={handleRetrieveClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleChataIdSubmit}
                className={styles.submitButton}
              >
                Restore Form
              </button>
            </div>
          </div>
        </div>
      )}

      {showChataIdInfo && currentChataId && (
        <div className={styles.blurryOverlay}>
          <div className={styles.dialogContent}>
            <button 
              className={styles.closeButton}
              onClick={handleChataIdInfoClose}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Important: Save Your CHATA ID</h3>
            <p>Please write down your CHATA ID to retrieve your form later:</p>
            <div className={styles.chataIdDisplay}>
              <span className={styles.blinkingId}>
                {currentChataId}
              </span>
            </div>
            <p className={styles.chataIdNote}>
              Your CHATA ID is your key to access this form later.<br />
              Keep it safe and secure.
            </p>
            <div className={styles.writingAnimation}>
              <DotLottieReact
                src="https://lottie.host/253cdb9a-9579-4d3b-a47a-8cb81dc9cbe1/Xb403sqrnQ.lottie"
                loop
                autoplay
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleChataIdInfoClose}
                className={styles.submitButton}
              >
                I've Saved My CHATA ID
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 