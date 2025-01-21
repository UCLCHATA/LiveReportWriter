import { useState, useCallback } from 'react';
import type { FormState, AssessmentData, ClinicianInfo, GlobalFormState } from '../types';

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>({
    formData: {} as FormState,
    assessments: {} as AssessmentData,
    clinicianInfo: null
  });

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates
      }
    }));
  }, []);

  const updateAssessment = useCallback((type: keyof AssessmentData, data: Partial<AssessmentData[keyof AssessmentData]>) => {
    setGlobalState(prev => ({
      ...prev,
      assessments: {
        ...prev.assessments,
        [type]: {
          ...prev.assessments[type],
          ...data,
          type,
          lastUpdated: new Date().toISOString()
        }
      }
    }));
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    setGlobalState(prev => ({
      ...prev,
      clinicianInfo: info
    }));
  }, []);

  const clearState = useCallback(() => {
    setGlobalState({
      formData: {} as FormState,
      assessments: {} as AssessmentData,
      clinicianInfo: null
    });
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