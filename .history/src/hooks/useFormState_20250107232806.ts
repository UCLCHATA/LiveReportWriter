import { useState, useEffect } from 'react';

interface ClinicianInfo {
  name: string;
  email: string;
}

interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: {
    referralReason: string;
    developmentalConcerns: string;
    medicalHistory: string;
    familyHistory: string;
    status: 'draft' | 'submitted';
    ascStatus: string;
    adhdStatus: string;
    referrals: {
      speech: boolean;
      educational: boolean;
      sleep: boolean;
      occupational: boolean;
      mental: boolean;
      other: boolean;
    };
    remarks: string;
    clinicalObservations: string;
    priorityAreas: string;
    strengths: string;
    recommendations: string;
    differentialDiagnosis?: string;
    lastUpdated: string;
  };
  assessments: {
    sensoryProfile: any | null;
    socialCommunication: any | null;
    behaviorInterests: any | null;
    milestones: any | null;
    assessmentLog: any | null;
  };
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
  progress: {
    form: number;
    carousel: number;
    lastUpdated: number;
  };
}

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
  status: 'draft',
  progress: {
    form: 0,
    carousel: 0,
    lastUpdated: Date.now()
  }
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  const [validatedChataId, setValidatedChataId] = useState<string>('');

  // Load state from localStorage when validatedChataId changes
  useEffect(() => {
    if (validatedChataId) {
      const saved = localStorage.getItem(getStorageKey(validatedChataId));
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          setGlobalState(parsedState);
        } catch (error) {
          console.error('Error loading form state:', error);
        }
      }
    }
  }, [validatedChataId]);

  // Save state to localStorage whenever it changes
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
      try {
        const state = JSON.parse(saved);
        if (state.status === 'draft') {
          return state;
        }
      } catch (error) {
        console.error('Error checking draft:', error);
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
    setGlobalState((prev: GlobalFormState) => ({
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
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      assessments: {
        ...prev.assessments,
        [type]: data
      }
    }));
  };

  const setClinicianInfo = (info: ClinicianInfo) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      clinician: info
    }));
  };

  const updateProgress = (formProgress?: number, carouselProgress?: number) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      progress: {
        form: formProgress ?? prev.progress.form,
        carousel: carouselProgress ?? prev.progress.carousel,
        lastUpdated: Date.now()
      }
    }));
  };

  const setChataId = (chataId: string) => {
    setValidatedChataId(chataId);
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      chataId
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
    updateProgress,
    setChataId,
    validatedChataId
  };
};