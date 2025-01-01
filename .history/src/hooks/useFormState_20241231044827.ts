import { useState, useEffect } from 'react';
import { GlobalFormState, ClinicianInfo } from '../types';

const STORAGE_KEY = 'chata-form-state';

const initialFormData = {
  referralReason: '',
  developmentalConcerns: '',
  medicalHistory: '',
  familyHistory: '',
  status: 'draft' as const,
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
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: ''
  },
  formData: initialFormData,
  assessments: {
    sensoryProfile: null,
    socialCommunication: null,
    behaviorInterests: null,
    milestones: null,
    assessmentLog: null
  },
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  // Autosave effect
  useEffect(() => {
    if (globalState) {
      const stateToSave = {
        ...globalState,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [globalState]);

  const checkExistingDraft = (email: string): GlobalFormState | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (state.clinician.email === email && state.status === 'draft') {
        return state;
      }
    }
    return null;
  };

  const restoreDraft = (email: string): GlobalFormState | null => {
    const draft = checkExistingDraft(email);
    if (draft) {
      setGlobalState(draft);
      return draft;
    }
    return null;
  };

  const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState(initialState);
  };

  const updateFormData = (updates: Partial<GlobalFormState['formData']>) => {
    setGlobalState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates
      }
    }));
  };

  const updateAssessment = (
    type: keyof GlobalFormState['assessments'],
    data: any
  ) => {
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
      chataId: `CHATA-${info.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
    }));
  };

  return {
    globalState,
    setGlobalState,
    checkExistingDraft,
    restoreDraft,
    clearState,
    updateFormData,
    updateAssessment,
    setClinicianInfo
  };
};