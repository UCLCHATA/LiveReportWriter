import { useState, useEffect, useCallback } from 'react';
import type { 
  GlobalFormState
} from '../types';
import type {
  RuntimeFormState,
  ClinicianInfo,
  FormData,
  AssessmentData
} from '../types/formState';
import { FormStateService } from '../services/formState';

// Create a singleton instance of FormStateService
const formStateService = new FormStateService();

export const useFormState = () => {
  const [state, setState] = useState<RuntimeFormState | null>(formStateService.getCurrentState());

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = formStateService.subscribe(setState);
    return () => { unsubscribe(); };
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

    formStateService.updateState({
      clinician: {
        name: info.name,
        email: info.email,
        clinicName: info.clinicName,
        childFirstName: info.childFirstName || '',
        childLastName: info.childLastName || '',
        childAge: info.childAge || '',
        childGender: info.childGender || '',
        chataId: info.chataId
      },
      chataId: info.chataId
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    if (!state) return;

    formStateService.updateState({
      formData: {
        ...state.formData,
        ...updates,
        lastUpdated: new Date().toISOString()
      }
    });
  }, [state]);

  const updateAssessment = useCallback((
    domain: keyof GlobalFormState['assessments'],
    data: AssessmentData[keyof AssessmentData]
  ) => {
    if (!state) return;

    formStateService.updateState({
      assessments: {
        ...state.assessments,
        [domain]: data
      } as Required<AssessmentData>
    });
  }, [state]);

  const clearState = useCallback(() => {
    formStateService.clearState();
  }, []);

  return {
    globalState: state ? {
      chataId: state.chataId,
      clinician: state.clinician,
      formData: state.formData,
      assessments: state.assessments,
      currentStep: 0,
      lastUpdated: (() => {
        try {
          return new Date(state.timestamp).toISOString();
        } catch (error) {
          console.error('Invalid timestamp:', state.timestamp);
          return new Date().toISOString();
        }
      })(),
      status: state.status
    } : null,
    setClinicianInfo,
    updateFormData,
    updateAssessment,
    clearState
  };
};