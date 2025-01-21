import { useState, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';
import { initialAssessments } from '../types';

type GlobalState = {
  chataId: string | null;
  formData: any;
  assessments: any;
};

const initialState: GlobalState = {
  chataId: null,
  formData: {},
  assessments: initialAssessments
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalState>(initialState);

  const setChataId = useCallback(async (chataId: string) => {
    console.log('[useFormState] Setting CHATA ID:', chataId);
    const savedForm = formPersistence.getForm(chataId);
    console.log('[useFormState] Retrieved form:', savedForm);

    setGlobalState(prev => ({
      ...prev,
      chataId,
      formData: savedForm?.formState || {},
      assessments: savedForm?.assessmentState || initialAssessments
    }));
  }, []);

  const updateFormData = useCallback((data: any) => {
    console.log('[useFormState] Updating form data:', data);
    setGlobalState(prev => {
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          ...data
        }
      };

      if (prev.chataId) {
        formPersistence.saveForm({
          chataId: prev.chataId,
          formState: newState.formData,
          assessmentState: newState.assessments,
          lastUpdated: Date.now(),
          clinicianInfo: {
            name: '',
            email: '',
            clinicName: ''
          },
          isSubmitted: false
        });
      }

      return newState;
    });
  }, []);

  const updateAssessments = useCallback((data: any) => {
    console.log('[useFormState] Updating assessments:', data);
    setGlobalState(prev => {
      const newState = {
        ...prev,
        assessments: {
          ...prev.assessments,
          ...data
        }
      };

      if (prev.chataId) {
        formPersistence.saveForm({
          chataId: prev.chataId,
          formState: newState.formData,
          assessmentState: newState.assessments,
          lastUpdated: Date.now(),
          clinicianInfo: {
            name: '',
            email: '',
            clinicName: ''
          },
          isSubmitted: false
        });
      }

      return newState;
    });
  }, []);

  return {
    globalState,
    setChataId,
    updateFormData,
    updateAssessments
  };
};