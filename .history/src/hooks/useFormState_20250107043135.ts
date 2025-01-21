import { useState, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';
import { AssessmentData, FormState, GlobalState, initialAssessments } from '../types';

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalState>({
    chataId: '',
    formData: null,
    assessments: initialAssessments
  });

  const setChataId = useCallback((chataId: string) => {
    console.log('[useFormState] Setting CHATA ID:', chataId);
    
    // Get saved form state
    const savedForm = formPersistence.getForm(chataId);
    
    if (!savedForm?.formState) {
      const initialFormState: FormState = {
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
        recommendations: ''
      };

      // Save initial state if we have clinician info
      if (savedForm?.clinicianInfo) {
        const newForm = {
          chataId,
          clinicianInfo: savedForm.clinicianInfo,
          formState: initialFormState,
          assessmentState: initialAssessments,
          isSubmitted: false
        };
        
        formPersistence.saveForm(newForm);
      }

      setGlobalState({
        chataId,
        formData: initialFormState,
        assessments: initialAssessments
      });
      return;
    }

    // Update state with saved data
    setGlobalState({
      chataId,
      formData: savedForm.formState,
      assessments: savedForm.assessmentState || initialAssessments
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState((prev: GlobalState) => {
      if (!prev.chataId) return prev;

      // Create new form data by merging existing state with updates
      const newFormData = {
        ...(prev.formData || {}),
        ...updates
      } as FormState;

      // Save to persistence first
      const savedForm = formPersistence.getForm(prev.chataId);
      if (savedForm?.clinicianInfo) {
        const updatedForm = {
          ...savedForm,
          formState: newFormData,
          assessmentState: prev.assessments,
          isSubmitted: false
        };
        formPersistence.saveForm(updatedForm);
      }

      // Then update state
      return {
        ...prev,
        formData: newFormData
      };
    });
  }, []);

  const updateAssessments = useCallback((updates: Partial<AssessmentData>) => {
    setGlobalState((prev: GlobalState) => {
      if (!prev.chataId) return prev;

      const newAssessments = {
        ...prev.assessments,
        ...updates
      };

      // Save to persistence first
      const savedForm = formPersistence.getForm(prev.chataId);
      if (savedForm?.clinicianInfo) {
        const updatedForm = {
          ...savedForm,
          formState: prev.formData || {},
          assessmentState: newAssessments,
          isSubmitted: false
        };
        formPersistence.saveForm(updatedForm);
      }

      // Then update state
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