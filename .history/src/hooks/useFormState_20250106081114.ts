import { useState, useCallback } from 'react';
import { FormData } from '../types';
import { formPersistence } from '../services/formPersistence';

interface GlobalState {
  chataId: string;
  formData: FormData | null;
}

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalState>({
    chataId: '',
    formData: null
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

  const setChataId = useCallback((chataId: string) => {
    setGlobalState(prev => ({
      ...prev,
      chataId
    }));

    // Try to restore form state from persistence
    const savedForm = formPersistence.getForm(chataId);
    if (savedForm?.formState) {
      setGlobalState(prev => ({
        ...prev,
        formData: savedForm.formState as FormData
      }));
    }
  }, []);

  const clearState = useCallback(() => {
    setGlobalState({
      chataId: '',
      formData: null
    });
  }, []);

  return {
    globalState,
    updateFormData,
    setChataId,
    clearState
  };
};