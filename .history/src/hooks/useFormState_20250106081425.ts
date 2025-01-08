import { useState, useCallback } from 'react';
import { FormData, AssessmentData } from '../types';
import { formPersistence } from '../services/formPersistence';

interface GlobalState {
  chataId: string;
  formData: FormData | null;
  assessments: AssessmentData;
}

const initialAssessments: AssessmentData = {
  sensoryProfile: null,
  socialCommunication: null,
  behaviorInterests: null,
  milestones: null,
  assessmentLog: null
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalState>({
    chataId: '',
    formData: null,
    assessments: initialAssessments
  });

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setGlobalState(prev => {
      const newFormData = {
        ...prev.formData,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // If we have a CHATA ID, save to persistence
      if (prev.chataId) {
        formPersistence.updateFormState(prev.chataId, newFormData);
      }

      return {
        ...prev,
        formData: newFormData as FormData
      };
    });
  }, []);

  const updateAssessments = useCallback((updates: Partial<AssessmentData>) => {
    setGlobalState(prev => {
      const newAssessments = {
        ...prev.assessments,
        ...updates
      };

      // If we have a CHATA ID, save to persistence
      if (prev.chataId) {
        formPersistence.updateAssessmentState(prev.chataId, newAssessments);
      }

      return {
        ...prev,
        assessments: newAssessments
      };
    });
  }, []);

  const setChataId = useCallback((chataId: string) => {
    setGlobalState(prev => ({
      ...prev,
      chataId
    }));

    // Try to restore form state from persistence
    const savedForm = formPersistence.getForm(chataId);
    if (savedForm) {
      setGlobalState(prev => ({
        ...prev,
        formData: savedForm.formState || null,
        assessments: savedForm.assessmentState || initialAssessments
      }));
    }
  }, []);

  const clearState = useCallback(() => {
    setGlobalState({
      chataId: '',
      formData: null,
      assessments: initialAssessments
    });
  }, []);

  return {
    globalState,
    updateFormData,
    updateAssessments,
    setChataId,
    clearState
  };
};