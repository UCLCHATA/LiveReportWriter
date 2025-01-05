import React, { useState, useMemo } from 'react';
import { useFormState } from '../hooks/useFormState';
import styles from './ClinicianModal.module.css';

type ClinicianInfo = {
  name: string;
  email: string;
  childName: string;
  childAge: string;
  childGender: string;
};

interface ClinicianModalProps {
  isOpen: boolean;
  onSubmit: (info: ClinicianInfo) => void;
  onCancel: () => void;
}

const generateAgeOptions = () => {
  const options = [];
  
  // Add 2-6 years with months
  for (let year = 2; year <= 6; year++) {
    for (let month = 0; month < 12; month++) {
      const totalMonths = year * 12 + month;
      if (totalMonths <= 71) { // Up to 5 years 11 months
        options.push({
          value: totalMonths.toString(),
          label: `${year} year${year > 1 ? 's' : ''}, ${month} month${month !== 1 ? 's' : ''} (${totalMonths} months)`
        });
      }
    }
  }
  
  // Add 6-13 years without months
  for (let year = 6; year <= 13; year++) {
    options.push({
      value: (year * 12).toString(),
      label: `${year} years`
    });
  }
  
  return options;
};

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
    childAge: '',
    childGender: '',
  });
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const ageOptions = useMemo(() => generateAgeOptions(), []);

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
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.compactField}`}>
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
                <div className={`${styles.formGroup} ${styles.compactField}`}>
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
            </div>

            <div className={styles.formSection}>
              <h3>Child Information (Optional)</h3>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.compactField}`}>
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
                <div className={`${styles.formGroup} ${styles.compactField}`}>
                  <label htmlFor="child-age">Child's Age</label>
                  <select
                    id="child-age"
                    value={clinicianInfo.childAge}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, childAge: e.target.value }))
                    }
                  >
                    <option value="">Select Age</option>
                    {ageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.compactField}`}>
                  <label htmlFor="child-gender">Child's Gender</label>
                  <select
                    id="child-gender"
                    value={clinicianInfo.childGender}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, childGender: e.target.value }))
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
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