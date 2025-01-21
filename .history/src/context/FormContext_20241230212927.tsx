import React, { createContext, useContext, useEffect, useState } from 'react';
import type { GlobalFormState, ClinicianInfo } from '../types';

const STORAGE_KEY = 'chata-form-state';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: ''
  },
  assessmentData: {
    referralReason: '',
    developmentalConcerns: '',
    medicalHistory: '',
    familyHistory: '',
    clinicalObservations: '',
    priorityAreas: '',
    strengths: '',
    recommendations: '',
    status: {
      asc: '',
      adhd: ''
    },
    referrals: {
      speech: false,
      educational: false,
      sleep: false,
      occupational: false,
      mental: false,
      other: false
    },
    remarks: ''
  },
  componentData: {
    sensoryProfile: null,
    socialCommunication: null,
    behaviorInterests: null,
    milestoneTracker: null,
    assessmentLog: null
  },
  formStatus: {
    isDraft: true,
    lastSaved: new Date().toISOString(),
    isAutosaved: false
  },
  currentStep: 0
};

interface FormContextType {
  state: GlobalFormState;
  setState: React.Dispatch<React.SetStateAction<GlobalFormState>>;
  checkExistingDraft: (email: string) => { exists: boolean; lastSaved?: string; clinicianName?: string };
  restoreDraft: (email: string) => GlobalFormState | null;
  clearState: () => void;
  updateFormData: (data: Partial<GlobalFormState>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalFormState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  // Autosave at regular intervals
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (state.clinician.email && state.formStatus.isDraft) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...state,
          formStatus: {
            ...state.formStatus,
            lastSaved: new Date().toISOString(),
            isAutosaved: true
          }
        }));
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state]);

  // Save on every state change
  useEffect(() => {
    if (state.clinician.email) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        formStatus: {
          ...state.formStatus,
          lastSaved: new Date().toISOString()
        }
      }));
    }
  }, [state]);

  const checkExistingDraft = (email: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedState = JSON.parse(saved) as GlobalFormState;
      if (savedState.clinician.email === email && savedState.formStatus.isDraft) {
        return {
          exists: true,
          lastSaved: savedState.formStatus.lastSaved,
          clinicianName: savedState.clinician.name
        };
      }
    }
    return { exists: false };
  };

  const restoreDraft = (email: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedState = JSON.parse(saved) as GlobalFormState;
      if (savedState.clinician.email === email && savedState.formStatus.isDraft) {
        setState(savedState);
        return savedState;
      }
    }
    return null;
  };

  const clearState = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateFormData = (data: Partial<GlobalFormState>) => {
    setState((prev: GlobalFormState) => ({
      ...prev,
      ...data,
      formStatus: {
        ...prev.formStatus,
        lastSaved: new Date().toISOString()
      }
    }));
  };

  return (
    <FormContext.Provider value={{
      state,
      setState,
      checkExistingDraft,
      restoreDraft,
      clearState,
      updateFormData
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}; 