import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { ChataIdInput } from './ChataIdInput';
import { formPersistence } from '../services/formPersistence';

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
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showRetrievalOverlay, setShowRetrievalOverlay] = useState(false);
  const ageOptions = useMemo(() => generateAgeOptions(), []);

  const createNewForm = () => {
    // Generate new CHATA ID and create new form
    const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName);
    setCurrentChataId(newChataId);
    
    // Delete any existing unsubmitted forms for this clinician
    const existingForms = formPersistence.getAllUnsubmittedForms();
    existingForms.forEach(form => {
      if (form.clinicianInfo.email === clinicianInfo.email) {
        formPersistence.markAsSubmitted(form.chataId);
      }
    });
    
    const formData = {
      chataId: newChataId,
      clinicianInfo: {
        name: clinicianInfo.name,
        email: clinicianInfo.email,
        clinicName: clinicianInfo.clinicName,
        childName: clinicianInfo.childName,
        childAge: clinicianInfo.childAge,
        childGender: clinicianInfo.childGender,
      },
      lastUpdated: Date.now(),
      isSubmitted: false
    };
    
    formPersistence.saveForm(formData);
    onSubmit({ ...clinicianInfo, chataId: newChataId });
    setShowChataIdInfo(true);
    onChataIdDialogChange?.(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email && clinicianInfo.clinicName) {
      // Check for existing form with same clinician/child combination
      const existingForm = formPersistence.getFormByClinicianAndChild(
        clinicianInfo.name,
        clinicianInfo.childName
      );

      if (existingForm && clinicianInfo.childName) {
        setChataIdInput(existingForm.chataId);
        setShowRetrievalOverlay(true);
        return;
      }

      createNewForm();
    }
  };

  const handleStartNew = () => {
    handleRetrieveClose();
    createNewForm();
  };

  const handleRetrieveClick = () => {
    setShowRetrievalOverlay(true);
  };

  const handleRetrieveClose = () => {
    setShowRetrievalOverlay(false);
    setChataIdInput('');
    setChataIdError('');
  };

  const handleChataIdSubmit = () => {
    if (!validateChataId(chataIdInput)) {
      setChataIdError('Invalid CHATA ID format (e.g., KV-UC-123)');
      return;
    }

    const existingForm = formPersistence.getForm(chataIdInput);
    if (!existingForm) {
      setChataIdError('No form found with this CHATA ID');
      return;
    }

    try {
      const info: ClinicianInfo = {
        name: existingForm.clinicianInfo.name,
        email: existingForm.clinicianInfo.email,
        clinicName: existingForm.clinicianInfo.clinicName,
        childName: existingForm.clinicianInfo.childName || '',
        childAge: existingForm.clinicianInfo.childAge || '',
        childGender: existingForm.clinicianInfo.childGender || '',
        chataId: chataIdInput
      };
      setClinicianInfo(info);
      onSubmit(info);
      setShowRetrievalOverlay(false);
      setChataIdError('');
      console.log('✅ Successfully restored form with CHATA ID:', chataIdInput);
    } catch (error) {
      console.error('❌ Error restoring form:', error);
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
            <div className={styles.formSection}>
              <h3>Clinician Information</h3>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.compactField} ${styles.clinicField}`}>
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
                <div className={`${styles.formGroup} ${styles.compactField} ${styles.emailField}`}>
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
                <div className={`${styles.formGroup} ${styles.compactField} ${styles.clinicField}`}>
                  <label htmlFor="clinic-name">Clinic Name</label>
                  <input
                    id="clinic-name"
                    type="text"
                    value={clinicianInfo.clinicName}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, clinicName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Child Information (Optional)</h3>
              <p className={styles.gdprNotice}>
                Child's information is stored locally on your computer only and is not transmitted to our servers. 
                This data is used solely for assessment purposes and will be automatically removed after 30 days of inactivity. 
                You can delete this information at any time by clearing your browser data.
              </p>
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
                <div className={`${styles.formGroup} ${styles.compactField} ${styles.ageField}`}>
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
                <div className={`${styles.formGroup} ${styles.compactField} ${styles.genderField}`}>
                  <label htmlFor="child-gender">Child's Gender</label>
                  <select
                    id="child-gender"
                    value={clinicianInfo.childGender}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, childGender: e.target.value }))
                    }
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
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

      {showRetrievalOverlay && (
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
              <button
                onClick={() => {
                  handleRetrieveClose();
                  handleSubmit(new Event('submit') as any);
                }}
                className={`${styles.submitButton} ${styles.startNewButton}`}
              >
                Start New
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