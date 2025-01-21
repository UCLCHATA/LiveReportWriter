import { useState, useEffect } from 'react';
import { GlobalFormState, ClinicianInfo } from '../types';

const getStorageKey = (chataId: string) => `chata-form-state-${chataId}`;

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
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  const [validatedChataId, setValidatedChataId] = useState<string>('');

  // Only save state if we have a validated CHATA ID
  useEffect(() => {
    if (validatedChataId && globalState) {
      const stateToSave = {
        ...globalState,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(getStorageKey(validatedChataId), JSON.stringify(stateToSave));
    }
  }, [globalState, validatedChataId]);

  const checkExistingDraft = (chataId: string): GlobalFormState | null => {
    const saved = localStorage.getItem(getStorageKey(chataId));
    if (saved) {
      const state = JSON.parse(saved);
      if (state.status === 'draft') {
        return state;
      }
    }
    return null;
  };

  const restoreDraft = (chataId: string): GlobalFormState | null => {
    const draft = checkExistingDraft(chataId);
    if (draft) {
      setValidatedChataId(chataId);
      setGlobalState(draft);
      return draft;
    }
    return null;
  };

  const clearState = () => {
    if (validatedChataId) {
      localStorage.removeItem(getStorageKey(validatedChataId));
    }
    setValidatedChataId('');
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
      clinician: info
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
    setClinicianInfo,
    validatedChataId
  };
};