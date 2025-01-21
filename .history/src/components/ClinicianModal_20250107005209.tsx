import React, { useState, useMemo, useEffect } from 'react';
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
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const ageOptions = useMemo(() => generateAgeOptions(), []);
  const [showRetrievalOverlay, setShowRetrievalOverlay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicianInfo.name || !clinicianInfo.email || !clinicianInfo.clinicName) {
      return;
    }

    // Check if we already have a CHATA ID (from retrieval)
    if (currentChataId) {
      console.log('Using existing CHATA ID:', currentChataId);
      onSubmit({ ...clinicianInfo, chataId: currentChataId });
      return;
    }

    // Get all forms for this clinician
    const existingForms = formPersistence.getAllUnsubmittedForms();
    const matchingForms = existingForms.filter(form => {
      const sameClinicianAndChild = form.clinicianInfo.name.toLowerCase() === clinicianInfo.name.toLowerCase() &&
        form.clinicianInfo.childName?.toLowerCase() === clinicianInfo.childName.toLowerCase();
      
      // Check if CHATA ID prefix matches (first 6 characters)
      const prefix = form.chataId.substring(0, 6);
      const expectedPrefix = generateChataId(clinicianInfo.name, clinicianInfo.childName).substring(0, 6);
      
      return sameClinicianAndChild && prefix === expectedPrefix;
    });

    if (matchingForms.length > 0) {
      console.log('Found matching existing form:', { 
        chataId: matchingForms[0].chataId,
        clinicianName: matchingForms[0].clinicianInfo.name,
        childName: matchingForms[0].clinicianInfo.childName
      });
      setShowDraftAlert(true);
      return;
    }

    // If no matching form found, create new one
    const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName);
    console.log('Generated new CHATA ID:', { 
      chataId: newChataId, 
      clinicianName: clinicianInfo.name,
      childName: clinicianInfo.childName
    });
    
    setCurrentChataId(newChataId);
    
    formPersistence.saveForm({
      chataId: newChataId,
      clinicianInfo,
      lastUpdated: Date.now(),
      isSubmitted: false
    });
    console.log('Saved new form:', { chataId: newChataId });
    
    onSubmit({ ...clinicianInfo, chataId: newChataId });
    setShowChataIdInfo(true);
    onChataIdDialogChange?.(true);
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
    setShowChataIdInfo(true);
    onChataIdDialogChange?.(true);
  };

  const handleCancel = () => {
    // Clear any unsubmitted forms for this clinician
    const existingForm = formPersistence.getFormByClinicianEmail(clinicianInfo.email);
    if (existingForm && !existingForm.isSubmitted) {
      formPersistence.markAsSubmitted(existingForm.chataId); // This effectively removes it from draft state
    }
    onCancel();
  };

  const handleRetrieveClick = () => {
    console.log('Opening retrieval overlay');
    setShowRetrievalOverlay(true);
    setShowDraftAlert(false); // Close the draft alert if it's open
  };

  const handleRetrieveClose = () => {
    console.log('Closing retrieval overlay');
    setShowRetrievalOverlay(false);
    setChataIdInput('');
    setChataIdError('');
  };

  const handleChataIdSubmit = () => {
    console.log('Handling CHATA ID submit with input:', chataIdInput);
    
    // Clear any previous error
    setChataIdError('');
    
    // Normalize the CHATA ID to uppercase and trim
    const normalizedChataId = chataIdInput.trim().toUpperCase();
    console.log('Normalized CHATA ID:', normalizedChataId);
    
    // Validate CHATA ID format first
    if (!validateChataId(normalizedChataId)) {
      setChataIdError('Invalid CHATA ID format');
      return;
    }
    
    // Check if form exists
    const form = formPersistence.getForm(normalizedChataId);
    console.log('Form retrieval result:', form ? 'Found' : 'Not found', { chataId: normalizedChataId });
    
    if (!form) {
      setChataIdError('No form found with this CHATA ID');
      return;
    }

    if (!form.clinicianInfo) {
      console.log('Form found but missing clinician info:', { chataId: normalizedChataId });
      setChataIdError('Invalid form data for this CHATA ID');
      return;
    }

    // Clean up any other unsubmitted forms for this clinician
    const existingForms = formPersistence.getAllUnsubmittedForms();
    existingForms.forEach(existingForm => {
      if (existingForm.chataId !== normalizedChataId && 
          existingForm.clinicianInfo.email.toLowerCase() === form.clinicianInfo.email.toLowerCase()) {
        console.log('Cleaning up unsubmitted form:', existingForm.chataId);
        formPersistence.markAsSubmitted(existingForm.chataId);
      }
    });

    console.log('Retrieved form data:', { 
      chataId: normalizedChataId, 
      clinicianName: form.clinicianInfo.name,
      childName: form.clinicianInfo.childName 
    });
    
    // Set clinician info
    const info: ClinicianInfo = {
      name: form.clinicianInfo.name || '',
      email: form.clinicianInfo.email || '',
      clinicName: form.clinicianInfo.clinicName || '',
      childName: form.clinicianInfo.childName || '',
      childAge: form.clinicianInfo.childAge || '',
      childGender: form.clinicianInfo.childGender || '',
      chataId: normalizedChataId
    };
    setClinicianInfo(info);
    setCurrentChataId(normalizedChataId);

    // Restore detailed form state from localStorage
    const detailedState = localStorage.getItem(`chata-form-state-${normalizedChataId}`);
    if (detailedState) {
      console.log('Found detailed form state:', { chataId: normalizedChataId });
      try {
        const parsedState = JSON.parse(detailedState);
        formPersistence.updateFormState(normalizedChataId, parsedState);
      } catch (e) {
        console.error('Error parsing detailed form state:', e);
      }
    } else {
      console.log('No detailed form state found:', { chataId: normalizedChataId });
    }

    // Restore assessment state if it exists
    if (form.assessmentState) {
      console.log('Found assessment state:', { chataId: normalizedChataId });
      formPersistence.updateAssessmentState(normalizedChataId, form.assessmentState);
    } else {
      console.log('No assessment state found, checking localStorage');
      // Try to find assessment data in localStorage
      const storedAssessments = localStorage.getItem(`chata_assessments_${normalizedChataId}`);
      if (storedAssessments) {
        try {
          const parsedAssessments = JSON.parse(storedAssessments);
          console.log('Found assessments in localStorage:', { chataId: normalizedChataId });
          formPersistence.updateAssessmentState(normalizedChataId, parsedAssessments);
        } catch (e) {
          console.error('Error parsing stored assessments:', e);
          setChataIdError('Error retrieving assessment data. Please try again or start a new form.');
          return;
        }
      } else {
        console.log('No assessment data found:', { chataId: normalizedChataId });
        setChataIdError('No assessment data found for this CHATA ID. Please start a new form.');
        return;
      }
    }

    // Submit to parent component which will trigger the hooks to load the saved state
    onSubmit(info);
    setShowRetrievalOverlay(false);
    setShowDraftAlert(false);
  };

  const handleRetrieveSubmit = () => {
    console.log('Retrieve submit clicked');
    handleChataIdSubmit();
  };

  const handleChataIdInfoClose = () => {
    setShowChataIdInfo(false);
    onChataIdDialogChange?.(false);
  };

  const handleSaveButtonClick = () => {
    setShowChataIdInfo(false);
    onChataIdDialogChange?.(false);
  };

  const retrievalOverlay = (showRetrievalOverlay || showDraftAlert) && (
    <div className={styles.blurryOverlay}>
      <div className={styles.dialogContent}>
        <button 
          className={styles.closeButton}
          onClick={handleRetrieveClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3>Retrieve Existing Form</h3>
        <p>Enter your CHATA ID to retrieve your form:</p>
        <div className={styles.chataIdInputContainer}>
          <ChataIdInput
            onChange={(value) => {
              console.log('CHATA ID input changed:', value);
              setChataIdInput(value);
            }}
            onSubmit={handleRetrieveSubmit}
          />
          {chataIdError && (
            <div className={styles.error}>{chataIdError}</div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          {showDraftAlert && (
            <button
              onClick={handleStartNew}
              className={styles.cancelButton}
            >
              Start New
            </button>
          )}
          <button
            onClick={handleRetrieveSubmit}
            className={styles.submitButton}
          >
            Retrieve Form
          </button>
        </div>
      </div>
    </div>
  );

  const chataIdDialog = showChataIdInfo && currentChataId && (
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
            onClick={handleSaveButtonClick}
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
              <button
                type="button"
                onClick={handleRetrieveClick}
                className={`${styles.submitButton} ${styles.retrieveButton}`}
              >
                Retrieve Form
              </button>
              <button type="submit" className={styles.submitButton}>
                Start Assessment
              </button>
            </div>
          </form>
        </div>
      </div>
      {retrievalOverlay}
      {chataIdDialog}
    </>
  );
}; 