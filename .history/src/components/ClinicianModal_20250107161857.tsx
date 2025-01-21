import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';
import { ChataIdInput } from './ChataIdInput';
import { useFormState } from '../contexts/FormStateContext';

type ClinicianInfo = {
  name: string;
  email: string;
  clinicName: string;
  childName?: string;
  childAge?: string;
  childGender?: string;
  chataId?: string;
};

interface ClinicianModalProps {
  onSubmit: (info: ClinicianInfo) => void;
  onCancel: () => void;
  onChataIdDialogChange?: (isOpen: boolean) => void;
}

const generateAgeOptions = () => {
  const options = [];
  
  // Add 2-6 years with months
  for (let year = 2; year <= 6; year++) {
    for (let month = 0; month <= 11; month++) {
      options.push({
        value: `${year}y${month}m`,
        label: `${year} years ${month} months`
      });
    }
  }
  
  return options;
};

export const ClinicianModal: React.FC<ClinicianModalProps> = ({
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
    childGender: ''
  });

  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [currentChataId, setCurrentChataId] = useState<string | null>(null);
  const [showRetrievalOverlay, setShowRetrievalOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ageOptions = useMemo(() => generateAgeOptions(), []);
  const { restoreDraft } = useFormState();

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
        form.clinicianInfo.childName?.toLowerCase() === clinicianInfo.childName?.toLowerCase();
      
      // Check if CHATA ID prefix matches (first 6 characters)
      const prefix = form.chataId.substring(0, 6);
      const expectedPrefix = generateChataId(clinicianInfo.name, clinicianInfo.childName || '').substring(0, 6);
      
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
    const newChataId = generateChataId(clinicianInfo.name, clinicianInfo.childName || '');
    console.log('Generated new CHATA ID:', { 
      chataId: newChataId, 
      clinicianName: clinicianInfo.name,
      childName: clinicianInfo.childName
    });
    
    setCurrentChataId(newChataId);
    
    formPersistence.saveForm({
      chataId: newChataId,
      clinicianInfo,
      formState: {
        status: 'draft',
        ascStatus: '',
        adhdStatus: '',
        referrals: {
          speech: false,
          educational: false,
          sleep: false,
          occupational: false,
          mental: false,
          other: false
        },
        remarks: '',
        clinicalObservations: '',
        priorityAreas: '',
        strengths: '',
        recommendations: ''
      },
      assessments: {
        sensoryProfile: null,
        socialCommunication: null,
        behaviorInterests: null,
        milestones: null,
        assessmentLog: null
      },
      lastUpdated: Date.now(),
      isSubmitted: false
    });
    console.log('Saved new form:', { chataId: newChataId });
    
    onSubmit({ ...clinicianInfo, chataId: newChataId });
    setShowChataIdInfo(true);
    onChataIdDialogChange?.(true);
  };

  const handleStartNew = () => {
    setShowDraftAlert(false);
    handleSubmit(new Event('submit') as any);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClinicianInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleRetrieveClick = () => {
    console.log('Opening retrieval overlay');
    setShowRetrievalOverlay(true);
    setShowDraftAlert(false);
  };

  const handleRetrieveClose = () => {
    console.log('Closing retrieval overlay');
    setShowRetrievalOverlay(false);
    setChataIdInput('');
    setChataIdError('');
  };

  const handleChataIdSubmit = async (chataId: string) => {
    setIsLoading(true);
    try {
      const normalizedId = chataId.toUpperCase().trim();
      if (!validateChataId(normalizedId)) {
        setChataIdError('Invalid CHATA ID format. Please use format: XXX-XXX-123.');
        return;
      }

      // Try to restore the draft
      const restored = restoreDraft(normalizedId);
      if (!restored) {
        setChataIdError('No form found with this CHATA ID');
        return;
      }

      // Update clinician info from the restored state
      setClinicianInfo({
        name: restored.clinician.name,
        email: restored.clinician.email,
        clinicName: restored.clinician.clinicName,
        childName: restored.clinician.childName,
        childAge: restored.clinician.childAge,
        childGender: restored.clinician.childGender,
        chataId: normalizedId
      });

      // Clear error state and input
      setChataIdError('');
      setChataIdInput('');
      setCurrentChataId(normalizedId);

      // Submit to parent component
      onSubmit({
        name: restored.clinician.name,
        email: restored.clinician.email,
        clinicName: restored.clinician.clinicName,
        childName: restored.clinician.childName,
        childAge: restored.clinician.childAge,
        childGender: restored.clinician.childGender,
        chataId: normalizedId
      });

      setShowRetrievalOverlay(false);
      setShowDraftAlert(false);
    } catch (error) {
      console.error('Error submitting CHATA ID:', error);
      setChataIdError('An error occurred while submitting the CHATA ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChataIdInfoClose = () => {
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
            onSubmit={(chataId: string) => handleChataIdSubmit(chataId)}
            error={chataIdError}
            isLoading={isLoading}
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
            onClick={() => handleChataIdSubmit(chataIdInput)}
            className={styles.submitButton}
            disabled={isLoading}
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
        <h3>Your CHATA ID</h3>
        <p>Please save your CHATA ID for future reference:</p>
        <div className={styles.chataIdDisplay}>
          <strong>{currentChataId}</strong>
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleChataIdInfoClose}
            className={styles.submitButton}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Clinician Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={clinicianInfo.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={clinicianInfo.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="clinicName">Clinic Name *</label>
              <input
                type="text"
                id="clinicName"
                name="clinicName"
                value={clinicianInfo.clinicName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="childName">Child's Name</label>
              <input
                type="text"
                id="childName"
                name="childName"
                value={clinicianInfo.childName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="childAge">Child's Age</label>
              <Select
                id="childAge"
                name="childAge"
                options={ageOptions}
                value={ageOptions.find(option => option.value === clinicianInfo.childAge)}
                onChange={(selected) => {
                  setClinicianInfo(prev => ({
                    ...prev,
                    childAge: selected?.value || ''
                  }));
                }}
                isClearable
                isSearchable
                placeholder="Select age..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="childGender">Child's Gender</label>
              <select
                id="childGender"
                name="childGender"
                value={clinicianInfo.childGender}
                onChange={handleInputChange}
              >
                <option value="">Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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