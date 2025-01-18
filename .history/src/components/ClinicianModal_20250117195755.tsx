import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { ChataIdInput } from './ChataIdInput';
import { formPersistence } from '../services/formPersistence';
import { ClinicianInfo } from '../types/index';

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
  const [clinicianInfo, setClinicianInfo] = useState<Partial<ClinicianInfo>>({
    name: '',
    email: '',
    clinicName: '',
    childFirstName: '',
    childLastName: '',
    childAge: '',
    childGender: '',
  });
  const [formattedInfo, setFormattedInfo] = useState<ClinicianInfo | null>(null);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showRetrievalOverlay, setShowRetrievalOverlay] = useState(false);
  const ageOptions = useMemo(() => generateAgeOptions(), []);

  const createNewForm = () => {
    if (!formattedInfo) return;
    
    // Generate new CHATA ID and create new form
    const newChataId = generateChataId(formattedInfo.name, formattedInfo.childFirstName);
    setCurrentChataId(newChataId);
    
    // Initialize new form with the generated CHATA ID
    formPersistence.initializeNewForm(newChataId);
    
    const formData = {
      chataId: newChataId,
      clinicianInfo: {
        ...formattedInfo,
        chataId: newChataId
      },
      lastUpdated: Date.now(),
      isSubmitted: false
    };
    
    formPersistence.saveForm(formData);
    onSubmit({
      ...formattedInfo,
      chataId: newChataId
    });
    setShowChataIdInfo(true);
    onChataIdDialogChange?.(true);
    setShowRetrievalOverlay(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim and validate required fields
    const trimmedName = clinicianInfo.name?.trim() || '';
    const trimmedEmail = clinicianInfo.email?.trim() || '';
    const trimmedClinicName = clinicianInfo.clinicName?.trim() || '';
    
    if (!trimmedName || !trimmedEmail || !trimmedClinicName) {
      // Show error to user that required fields are missing
      return;
    }
    
    const formatted = {
      name: trimmedName,
      email: trimmedEmail,
      clinicName: trimmedClinicName,
      childFirstName: clinicianInfo.childFirstName?.trim() || '',
      childLastName: clinicianInfo.childLastName?.trim() || '',
      childAge: clinicianInfo.childAge || '',
      childGender: clinicianInfo.childGender?.trim() || ''
    };
    
    setFormattedInfo(formatted);

    // Check for existing form with same clinician/child combination
    const existingForm = formPersistence.getFormByClinicianAndChild(
      formatted.name,
      formatted.childFirstName
    );

    if (existingForm && formatted.childFirstName) {
      setChataIdInput(existingForm.chataId);
      setShowRetrievalOverlay(true);
      return;
    }

    createNewForm();
  };

  const handleStartNew = () => {
    setShowRetrievalOverlay(false);
    setChataIdError('');
    createNewForm();
  };

  const handleRetrieveClick = () => {
    // Check if we have clinician name
    if (!clinicianInfo.name) {
      setChataIdError('Please enter clinician name first');
      return;
    }

    // Try to restore form
    const restoredForm = formPersistence.restoreForm(
      clinicianInfo.name,
      clinicianInfo.childFirstName || undefined
    );

    if (restoredForm) {
      try {
        const info: ClinicianInfo = {
          name: restoredForm.clinicianInfo.name,
          email: restoredForm.clinicianInfo.email,
          clinicName: restoredForm.clinicianInfo.clinicName,
          childFirstName: restoredForm.clinicianInfo.childFirstName || '',
          childLastName: restoredForm.clinicianInfo.childLastName || '',
          childAge: restoredForm.clinicianInfo.childAge || '',
          childGender: restoredForm.clinicianInfo.childGender || '',
          chataId: restoredForm.chataId
        };
        setClinicianInfo(info);
        onSubmit(info);
        console.log('✅ Successfully restored form for clinician:', info.name);
      } catch (error) {
        console.error('Failed to restore form:', error);
        setChataIdError('Failed to restore form data');
      }
    } else {
      setChataIdError('No saved form found for this clinician and child');
    }
  };

  const handleRetrieveClose = () => {
    setShowRetrievalOverlay(false);
    setChataIdInput('');
    setChataIdError('');
  };

  const handleChataIdInfoClose = () => {
    setShowChataIdInfo(false);
    onChataIdDialogChange?.(false);
    onCancel(); // Close the modal after user acknowledges CHATA ID
  };

  // Update component mount logic to not show CHATA ID info on load
  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setShowChataIdInfo(false);
      setChataIdInput('');
      setChataIdError('');
      setShowRetrievalOverlay(false);
      setCurrentChataId(null);
    }
  }, [isOpen]);

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
                  <label htmlFor="childFirstName">Child's First Name</label>
                  <input
                    type="text"
                    id="childFirstName"
                    name="childFirstName"
                    value={clinicianInfo.childFirstName || ''}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, childFirstName: e.target.value }))
                    }
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.compactField}`}>
                  <label htmlFor="childLastName">Child's Last Name</label>
                  <input
                    type="text"
                    id="childLastName"
                    name="childLastName"
                    value={clinicianInfo.childLastName || ''}
                    onChange={(e) =>
                      setClinicianInfo((prev) => ({ ...prev, childLastName: e.target.value }))
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
            <p>A saved form was found for this clinician/child combination.</p>
            <p>Would you like to restore it?</p>
            {chataIdError && <div className={styles.error}>{chataIdError}</div>}
            <div className={styles.buttonGroup}>
              <button
                onClick={handleRetrieveClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleRetrieveClick}
                className={styles.submitButton}
              >
                Restore Form
              </button>
              <button
                onClick={handleStartNew}
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