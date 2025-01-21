import React, { useState, useMemo } from 'react';
import { useFormState } from '../hooks/useFormState';
import Select from 'react-select';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';

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

interface AgeOption {
  value: string;
  label: string;
}

const generateAgeOptions = () => {
  const options: AgeOption[] = [];
  
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
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const ageOptions = useMemo(() => generateAgeOptions(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email) {
      const existingForm = formPersistence.getFormByClinicianEmail(clinicianInfo.email);
      if (existingForm) {
        setShowDraftAlert(true);
        return;
      }

      const chataId = generateChataId(clinicianInfo.name);
      formPersistence.saveForm({
        chataId,
        clinicianInfo,
        lastUpdated: Date.now(),
        isSubmitted: false
      });

      setShowChataIdInfo(true);
      onSubmit(clinicianInfo);
    }
  };

  const handleRestoreDraft = () => {
    setShowDraftAlert(false);
    setShowChataIdInfo(false);
    setChataIdInput('');
  };

  const handleChataIdSubmit = () => {
    if (!validateChataId(chataIdInput)) {
      setChataIdError('Invalid CHATA ID format');
      return;
    }

    const form = formPersistence.getForm(chataIdInput);
    if (!form) {
      setChataIdError('No form found with this CHATA ID');
      return;
    }

    setClinicianInfo(form.clinicianInfo);
    onSubmit(form.clinicianInfo);
    setShowDraftAlert(false);
    setChataIdError('');
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
                  <Select
                    inputId="child-age"
                    options={ageOptions}
                    value={ageOptions.find(opt => opt.value === clinicianInfo.childAge)}
                    onChange={(selected) =>
                      setClinicianInfo((prev) => ({ 
                        ...prev, 
                        childAge: selected?.value || '' 
                      }))
                    }
                    isSearchable
                    isClearable
                    placeholder="Type or select age"
                    className={styles.ageSelect}
                    classNamePrefix="age-select"
                  />
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
            <h3>Existing Form Found</h3>
            <p>Please enter your CHATA ID to retrieve your form:</p>
            <div className={styles.chataIdInput}>
              <input
                type="text"
                value={chataIdInput}
                onChange={(e) => setChataIdInput(e.target.value.toUpperCase())}
                placeholder="Enter CHATA ID (e.g., JS-202401-1234)"
              />
              {chataIdError && <div className={styles.error}>{chataIdError}</div>}
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setShowDraftAlert(false)}
                className={styles.cancelButton}
              >
                Start New
              </button>
              <button
                onClick={handleChataIdSubmit}
                className={styles.submitButton}
              >
                Retrieve Form
              </button>
            </div>
          </div>
        </div>
      )}

      {showChataIdInfo && (
        <div className={styles.modalOverlay}>
          <div className={styles.alertContent}>
            <h3>Important: Save Your CHATA ID</h3>
            <p>
              Please write down your CHATA ID for future reference. You'll need this to retrieve your form if you need to continue later:
            </p>
            <div className={styles.chataIdDisplay}>
              {generateChataId(clinicianInfo.name)}
            </div>
            <p className={styles.chataIdNote}>
              This ID is based on your initials and today's date, making it easy to remember.
              Keep it safe in case you need to resume your assessment later.
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setShowChataIdInfo(false)}
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