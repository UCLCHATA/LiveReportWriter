import { useState, useEffect, useCallback } from 'react';
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

const STORAGE_KEY = 'chata-form-state';
let saveTimeout: NodeJS.Timeout | null = null;

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
  formProgress: 0,
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
      },
      progress: 0
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
      },
      progress: 0
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
      },
      progress: 0
    },
    milestones: {
      type: 'milestoneTracker',
      milestones: [],
      history: '',
      progress: 0
    },
    assessmentLog: {
      type: 'assessmentLog',
      selectedAssessments: [],
      entries: {},
      progress: 0
    }
  },
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'draft') {
          console.log('🔄 Restored saved state');
          return parsed;
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore state:', error);
    }
    console.log('📝 Using initial state');
    return initialState;
  });

  // Debounced save
  const saveState = useCallback((state: GlobalFormState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      try {
        const stateToSave = {
          ...state,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('💾 State saved');
      } catch (error) {
        console.error('❌ Failed to save state:', error);
      }
    }, 1000);
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (globalState !== initialState) {
      saveState(globalState);
    }
  }, [globalState, saveState]);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState(initialState);
    console.log('🗑️ State cleared');
  }, []);

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => {
      // Don't update if values haven't changed
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => prev.formData[key as keyof FormState] !== value
      );
      if (!hasChanges) return prev;

      return {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates
        }
      };
    });
  }, []);

  const updateAssessment = useCallback((type: keyof AssessmentData, data: any) => {
    setGlobalState(prev => {
      // Don't update if values haven't changed
      const hasChanges = Object.entries(data).some(
        ([key, value]) => prev.assessments[type][key] !== value
      );
      if (!hasChanges) return prev;

      return {
        ...prev,
        assessments: {
          ...prev.assessments,
          [type]: {
            ...prev.assessments[type],
            ...data
          }
        }
      };
    });
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    setGlobalState(prev => {
      // Don't update if values haven't changed
      const hasChanges = Object.entries(info).some(
        ([key, value]) => prev.clinician[key as keyof ClinicianInfo] !== value
      );
      if (!hasChanges) return prev;

      return {
        ...prev,
        clinician: info,
        chataId: info.chataId || prev.chataId
      };
    });
  }, []);

  return {
    globalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};