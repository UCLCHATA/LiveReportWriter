import { useState, useEffect, useCallback } from 'react';
import type { 
  ClinicianInfo, 
  AssessmentData,
  GlobalFormState,
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  MilestoneTrackerData,
  AssessmentLogData,
  AssessmentSummaryData,
  FormData
} from '../types/index';

// Define the FormPersistenceService type
type PersistenceFormData = {
  chataId: string;
  clinicianInfo: ClinicianInfo;
  lastUpdated: number;
  isSubmitted: boolean;
  isDirty?: boolean;
  formData: FormData;
  assessments: AssessmentData;
};

// Initialize form persistence service
const formPersistence = new (class FormPersistenceService {
  getStoredForm(): PersistenceFormData | null { return null; }
  saveForm(form: PersistenceFormData): void { }
  clearForm(): void { }
})();

// Add back initial state and validation
const initialFormData: FormData = {
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
  recommendations: '',
  formProgress: 0,
  lastUpdated: new Date().toISOString(),
  differentialDiagnosis: '',
  developmentalConcerns: '',
  medicalHistory: '',
  familyHistory: ''
};

const initialAssessmentData: Required<AssessmentData> = {
  sensoryProfile: {
    type: 'sensoryProfile',
    domains: {
      visual: { name: 'Visual', value: 0, observations: [], label: 'Typical' },
      auditory: { name: 'Auditory', value: 0, observations: [], label: 'Typical' },
      tactile: { name: 'Tactile', value: 0, observations: [], label: 'Typical' },
      vestibular: { name: 'Vestibular', value: 0, observations: [], label: 'Typical' },
      proprioceptive: { name: 'Proprioceptive', value: 0, observations: [], label: 'Typical' },
      oral: { name: 'Oral', value: 0, observations: [], label: 'Typical' }
    },
    progress: 0,
    isComplete: false
  },
  socialCommunication: {
    type: 'socialCommunication',
    domains: {
      jointAttention: { name: 'Joint Attention', value: 0, observations: [], label: 'Emerging' },
      nonverbalCommunication: { name: 'Non-verbal Communication', value: 0, observations: [], label: 'Emerging' },
      verbalCommunication: { name: 'Verbal Communication', value: 0, observations: [], label: 'Emerging' },
      socialUnderstanding: { name: 'Social Understanding', value: 0, observations: [], label: 'Emerging' },
      playSkills: { name: 'Play Skills', value: 0, observations: [], label: 'Emerging' },
      peerInteractions: { name: 'Peer Interactions', value: 0, observations: [], label: 'Emerging' }
    },
    progress: 0,
    isComplete: false
  },
  behaviorInterests: {
    type: 'behaviorInterests',
    domains: {
      repetitiveBehaviors: { name: 'Repetitive Behaviors', value: 0, observations: [], label: 'Moderate Impact' },
      routinesRituals: { name: 'Routines & Rituals', value: 0, observations: [], label: 'Moderate Impact' },
      specialInterests: { name: 'Special Interests', value: 0, observations: [], label: 'Moderate Impact' },
      sensoryInterests: { name: 'Sensory Interests', value: 0, observations: [], label: 'Moderate Impact' },
      emotionalRegulation: { name: 'Emotional Regulation', value: 0, observations: [], label: 'Moderate Impact' },
      flexibility: { name: 'Flexibility', value: 0, observations: [], label: 'Moderate Impact' }
    },
    progress: 0,
    isComplete: false
  },
  milestones: {
    type: 'milestoneTracker',
    milestones: [],
    customMilestones: [],
    history: '',
    progress: 0,
    formProgress: 0,
    isComplete: false,
    lastUpdated: new Date().toISOString()
  },
  assessmentLog: {
    type: 'assessmentLog',
    selectedAssessments: [],
    entries: {},
    progress: 0,
    isComplete: false
  },
  summary: {
    type: 'summary',
    progress: 0,
    isComplete: false,
    lastUpdated: new Date().toISOString()
  }
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
    childFirstName: '',
    childLastName: '',
    childAge: '',
    childGender: ''
  },
  formData: initialFormData,
  assessments: initialAssessmentData,
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  
  // Load initial state from persistence service
  useEffect(() => {
    const storedForm = formPersistence.getStoredForm();
    if (storedForm) {
      setGlobalState(prev => ({
        ...prev,
        chataId: storedForm.chataId,
        clinician: storedForm.clinicianInfo,
        formData: storedForm.formData || initialFormData,
        assessments: storedForm.assessments || initialState.assessments
      }));
    }
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    console.log('🔄 Setting clinician info:', info);
    if (!info.name || !info.email || !info.clinicName) {
      console.error('Missing required clinician fields:', {
        name: !!info.name,
        email: !!info.email,
        clinicName: !!info.clinicName
      });
      return;
    }
    
    setGlobalState(prev => {
      const newState = {
        ...prev,
        clinician: {
          name: info.name,
          email: info.email,
          clinicName: info.clinicName,
          childFirstName: info.childFirstName || prev.clinician?.childFirstName || '',
          childLastName: info.childLastName || prev.clinician?.childLastName || '',
          childAge: info.childAge || prev.clinician?.childAge || '',
          childGender: info.childGender || prev.clinician?.childGender || '',
          chataId: info.chataId || prev.chataId
        },
        chataId: info.chataId || prev.chataId
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: newState.chataId,
        clinicianInfo: newState.clinician,
        formData: prev.formData,
        assessments: prev.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates,
          lastUpdated: new Date().toISOString()
        }
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: prev.chataId,
        clinicianInfo: prev.clinician,
        formData: newState.formData,
        assessments: prev.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const updateAssessment = useCallback((
    domain: keyof GlobalFormState['assessments'],
    data: AssessmentData
  ) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        assessments: {
          ...prev.assessments,
          [domain]: data
        }
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: prev.chataId,
        clinicianInfo: prev.clinician,
        formData: prev.formData,
        assessments: newState.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const clearState = useCallback(() => {
    formPersistence.clearForm();
    setGlobalState(initialState);
  }, []);

  return {
    globalState,
    setGlobalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};