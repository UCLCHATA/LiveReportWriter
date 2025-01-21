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

const getStorageKey = (chataId: string) => `chata-form-state-${chataId}`;

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
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());

  // Attempt to restore state on mount
  useEffect(() => {
    const storedChataId = localStorage.getItem('last-active-chata-id');
    if (storedChataId) {
      const draft = checkExistingDraft(storedChataId);
      if (draft) {
        setValidatedChataId(storedChataId);
        setGlobalState(draft);
      }
    }
  }, []);

  // Save state with debounce
  useEffect(() => {
    if (validatedChataId && globalState) {
      // Debounce save to prevent excessive writes
      const now = Date.now();
      if (now - lastSaveTime > 1000) { // Only save if more than 1 second has passed
        const stateToSave = {
          ...globalState,
          lastUpdated: new Date().toISOString()
        };
        try {
          localStorage.setItem(getStorageKey(validatedChataId), JSON.stringify(stateToSave));
          localStorage.setItem('last-active-chata-id', validatedChataId);
          setLastSaveTime(now);
        } catch (error) {
          console.error('Failed to save form state:', error);
          // TODO: Show user-friendly error notification
        }
      }
    }
  }, [globalState, validatedChataId, lastSaveTime]);

  const checkExistingDraft = (chataId: string): GlobalFormState | null => {
    try {
      const saved = localStorage.getItem(getStorageKey(chataId));
      if (saved) {
        const state = JSON.parse(saved);
        if (state.status === 'draft') {
          return state;
        }
      }
    } catch (error) {
      console.error('Failed to check existing draft:', error);
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
    try {
      if (validatedChataId) {
        localStorage.removeItem(getStorageKey(validatedChataId));
        localStorage.removeItem('last-active-chata-id');
      }
      setValidatedChataId('');
      setGlobalState(initialState);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
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