import React, { useState } from 'react';
import { useFormState } from '../hooks/useFormState';
import styles from './ClinicianModal.module.css';

type ClinicianInfo = {
  name: string;
  email: string;
  childName?: string;
  childDob?: string;
  childGender?: string;
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
    childName: '',
    childDob: '',
    childGender: '',
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
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Enter Assessment Details</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h3>Clinician Information</h3>
              <div className={styles.formGroup}>
                <label htmlFor="clinician-name">Clinician Name</label>
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
                <label htmlFor="clinician-email">Clinician Email</label>
                <input
                  id="clinician-email"
                  type="email"
                  value={clinicianInfo.email}
                  onChange={(e) =>
                    setClinicianInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Child Information</h3>
              <div className={styles.formGroup}>
                <label htmlFor="child-name">Child's Name</label>
                <input
                  id="child-name"
                  type="text"
                  value={clinicianInfo.childName}
                  onChange={(e) =>
                    setClinicianInfo((prev) => ({ ...prev, childName: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="child-dob">Date of Birth</label>
                <input
                  id="child-dob"
                  type="date"
                  value={clinicianInfo.childDob}
                  onChange={(e) =>
                    setClinicianInfo((prev) => ({ ...prev, childDob: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="child-gender">Gender</label>
                <select
                  id="child-gender"
                  value={clinicianInfo.childGender}
                  onChange={(e) =>
                    setClinicianInfo((prev) => ({ ...prev, childGender: e.target.value }))
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
              We found an unsubmitted assessment form under this email.
              Would you like to restore it?
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setShowDraftAlert(false)}
                className={styles.cancelButton}
              >
                Start New
              </button>
              <button
                onClick={handleRestoreDraft}
                className={styles.submitButton}
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