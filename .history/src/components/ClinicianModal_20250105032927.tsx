import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
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
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const ageOptions = useMemo(() => generateAgeOptions(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email && clinicianInfo.clinicName) {
      const existingForm = formPersistence.getFormByClinicianEmail(clinicianInfo.email);
      if (existingForm && 
          existingForm.clinicianInfo.name.toLowerCase() === clinicianInfo.name.toLowerCase() &&
          existingForm.clinicianInfo.childName?.toLowerCase() === clinicianInfo.childName.toLowerCase()) {
        setShowDraftAlert(true);
        return;
      }

      const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName);
      setCurrentChataId(newChataId);
      
      formPersistence.saveForm({
        chataId: newChataId,
        clinicianInfo,
        lastUpdated: Date.now(),
        isSubmitted: false
      });
      
      onSubmit({ ...clinicianInfo, chataId: newChataId });
      setTimeout(() => setShowChataIdInfo(true), 100);
    }
  };

  const handleStartNew = () => {
    const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName);
    setCurrentChataId(newChataId);
    
    formPersistence.saveForm({
      chataId: newChataId,
      clinicianInfo,
      lastUpdated: Date.now(),
      isSubmitted: false
    });
    
    onSubmit({ ...clinicianInfo, chataId: newChataId });
    setShowDraftAlert(false);
    setTimeout(() => setShowChataIdInfo(true), 100);
  };

  const handleCancel = () => {
    // Clear any unsubmitted forms for this clinician
    const existingForm = formPersistence.getFormByClinicianEmail(clinicianInfo.email);
    if (existingForm && !existingForm.isSubmitted) {
      formPersistence.markAsSubmitted(existingForm.chataId); // This effectively removes it from draft state
    }
    onCancel();
  };

  const handleChataIdSubmit = () => {
    if (!validateChataId(chataIdInput)) {
      setChataIdError('Invalid CHATA ID format (e.g., KV-UC-123 for Kevin Vora from UCL)');
      return;
    }

    const form = formPersistence.getForm(chataIdInput);
    if (!form) {
      setChataIdError('No form found with this CHATA ID');
      return;
    }

    if (form.clinicianInfo) {
      const info: ClinicianInfo = {
        name: form.clinicianInfo.name,
        email: form.clinicianInfo.email,
        clinicName: form.clinicianInfo.clinicName || '',
        childName: form.clinicianInfo.childName || '',
        childAge: form.clinicianInfo.childAge || '',
        childGender: form.clinicianInfo.childGender || ''
      };
      setClinicianInfo(info);
      onSubmit(info);
    }
    setShowDraftAlert(false);
    setChataIdError('');
  };

  const handleChataIdInfoClose = () => {
    setShowChataIdInfo(false);
  };

  const chataIdDialog = showChataIdInfo && currentChataId && (
    <div className={styles.blurryOverlay}>
      <div className={styles.dialogContent}>
        <button 
          className={styles.closeButton}
          onClick={() => {
            setShowChataIdInfo(false);
            // Don't clear currentChataId as it's still needed in header
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h3>Important: Save Your CHATA ID</h3>
        <p>Please write down your CHATA ID to retrieve your form later if needed:</p>
        <div className={styles.chataIdDisplay}>
          <span className={styles.blinkingId}>
            {currentChataId}
          </span>
        </div>
        <p className={styles.chataIdNote}>
          Your CHATA ID breaks down as:<br />
          • Your code: {currentChataId.split('-')[0]}<br />
          • Child's code: {currentChataId.split('-')[1]}<br />
          • Unique number: {currentChataId.split('-')[2]}
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
            onClick={() => setShowChataIdInfo(false)}
            className={styles.submitButton}
          >
            I've Saved My CHATA ID
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return chataIdDialog;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button 
            className={styles.closeButton}
            onClick={handleCancel}
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
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={handleCancel}>
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
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowDraftAlert(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Existing Form Found</h3>
            <p>Please enter your CHATA ID to retrieve your form:</p>
            <div className={styles.chataIdInput}>
              <input
                type="text"
                value={chataIdInput}
                onChange={(e) => setChataIdInput(e.target.value.toUpperCase())}
                placeholder="e.g., KV-UC-123 (Kevin Vora, UCL)"
              />
              {chataIdError && <div className={styles.error}>{chataIdError}</div>}
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleStartNew}
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
    </>
  );
}; 