import { useState, useEffect } from 'react';
import { FormState, ClinicianInfo, AssessmentData } from '../types';

interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: FormState;
  assessments: AssessmentData;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

// Single storage key for simplicity
const STORAGE_KEY = 'chata-form-state';

const initialFormData: FormState = {
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
  progress: 0,
  lastUpdated: new Date().toISOString()
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
    childName: '',
    childAge: '',
    childGender: ''
  },
  formData: initialFormData,
  assessments: {
    sensoryProfile: {
      type: 'sensoryProfile',
      domains: {
        visual: { value: 0, observations: [] },
        auditory: { value: 0, observations: [] },
        tactile: { value: 0, observations: [] },
        vestibular: { value: 0, observations: [] },
        proprioceptive: { value: 0, observations: [] },
        oral: { value: 0, observations: [] }
      }
    },
    socialCommunication: {
      type: 'socialCommunication',
      domains: {
        jointAttention: { value: 0, observations: [] },
        nonverbalCommunication: { value: 0, observations: [] },
        verbalCommunication: { value: 0, observations: [] },
        socialUnderstanding: { value: 0, observations: [] },
        playSkills: { value: 0, observations: [] },
        peerInteractions: { value: 0, observations: [] }
      }
    },
    behaviorInterests: {
      type: 'behaviorInterests',
      domains: {
        repetitiveBehaviors: { value: 0, observations: [] },
        routinesRituals: { value: 0, observations: [] },
        specialInterests: { value: 0, observations: [] },
        sensoryInterests: { value: 0, observations: [] },
        emotionalRegulation: { value: 0, observations: [] },
        flexibility: { value: 0, observations: [] }
      }
    },
    milestones: {
      type: 'milestoneTracker',
      milestones: [],
      history: ''
    },
    assessmentLog: {
      type: 'assessmentLog',
      selectedAssessments: [],
      entries: {}
    }
  },
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    // Try to restore state on initial load
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'draft') {
          console.log('Restored state:', parsed);
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
    return initialState;
  });

  // Save state whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        ...globalState,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log('Saved state:', stateToSave);
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [globalState]);

  const clearState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setGlobalState(initialState);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  };

  const updateFormData = (updates: Partial<FormState>) => {
    setGlobalState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates
      }
    }));
  };

  const updateAssessment = (type: keyof AssessmentData, data: any) => {
    setGlobalState(prev => ({
      ...prev,
      assessments: {
        ...prev.assessments,
        [type]: data
      }
    }));
  };

  const setClinicianInfo = (info: ClinicianInfo) => {
    setGlobalState(prev => ({
      ...prev,
      clinician: info,
      chataId: info.chataId || prev.chataId
    }));
  };

  return {
    globalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};