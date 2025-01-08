import { useState, useCallback } from 'react';
import type { FormData } from '../services/formPersistence';

interface AssessmentData {
  sensoryProfile: any;
  socialCommunication: any;
  behaviorInterests: any;
  milestones: any;
  assessmentLog: any;
}

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
        chataId,
        formData: savedForm.formState || null,
        assessments: savedForm.assessmentState || initialAssessments
      }));
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setGlobalState(prev => {
      if (!prev.chataId) {
        console.error('No CHATA ID available for saving');
        return prev;
      }

      const newFormData = {
        ...prev.formData,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Save to persistence with full form data
      formPersistence.saveForm({
        chataId: prev.chataId,
        formState: newFormData as FormData,
        assessmentState: prev.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        clinicianInfo: prev.formData?.clinicianInfo || {}
      });

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