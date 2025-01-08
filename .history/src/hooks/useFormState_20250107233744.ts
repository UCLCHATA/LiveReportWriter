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
  };
  assessments: {
    sensoryProfile: any | null;
    socialCommunication: any | null;
    behaviorInterests: any | null;
    milestones: any | null;
    assessmentLog: any | null;
  };
  currentStep: number;
  status: 'draft' | 'submitted';
  progress: {
    form: number;
    carousel: number;
  };
}

const getStorageKey = (chataId: string) => `chata-form-state-${chataId}`;

const validateChataId = (chataId: string): boolean => {
  // Format: XX-YY-NNN where:
  // XX = First and last initial of clinician
  // YY = Institution code (e.g., UC for UCL)
  // NNN = 3-digit number
  const pattern = /^[A-Z]{2}-[A-Z]{2}-\d{3}$/;
  return pattern.test(chataId);
};

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
  status: 'draft',
  progress: {
    form: 0,
    carousel: 0
  }
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  const [validatedChataId, setValidatedChataId] = useState<string>('');

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

  useEffect(() => {
    if (validatedChataId && globalState) {
      localStorage.setItem(getStorageKey(validatedChataId), JSON.stringify(globalState));
    }
  }, [globalState, validatedChataId]);

  const checkExistingDraft = (chataId: string): GlobalFormState | null => {
    if (!validateChataId(chataId)) {
      throw new Error('Invalid CHATA ID format (e.g., KV-UC-123 for Kevin Vora from UCL)');
    }
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
    try {
      const draft = checkExistingDraft(chataId);
      if (draft) {
        setValidatedChataId(chataId);
        setGlobalState(draft);
        return draft;
      }
    } catch (error) {
      console.error(error);
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
        carousel: carouselProgress ?? prev.progress.carousel
      }
    }));
  };

  const setChataId = (chataId: string) => {
    if (!validateChataId(chataId)) {
      throw new Error('Invalid CHATA ID format (e.g., KV-UC-123 for Kevin Vora from UCL)');
    }
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