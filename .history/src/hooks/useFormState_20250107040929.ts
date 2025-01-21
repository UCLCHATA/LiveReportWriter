import { useState, useCallback, useRef } from 'react';
import { formPersistence } from '../services/formPersistence';
import { AssessmentData, FormState, GlobalState, initialAssessments } from '../types';

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalState>({
    chataId: '',
    formData: null,
    assessments: initialAssessments
  });

  // Add debounce timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const setChataId = useCallback((chataId: string) => {
    console.log('[useFormState] Setting CHATA ID:', chataId);
    
    // Get saved form state
    const savedForm = formPersistence.getForm(chataId);
    console.log('[useFormState] Retrieved saved form:', {
      hasForm: !!savedForm,
      hasFormState: !!savedForm?.formState
    });
    
    if (!savedForm?.formState) {
      console.log('[useFormState] No saved form state found, initializing new state');
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
          isSubmitted: false,
          lastUpdated: Date.now()
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
      if (!prev.chataId) {
        console.log('[useFormState] No CHATA ID available for saving');
        return prev;
      }

      // Get existing form to preserve all data
      const savedForm = formPersistence.getForm(prev.chataId);
      if (!savedForm?.clinicianInfo) {
        return prev;
      }

      // Create new form data by merging existing state with updates
      const newFormData = {
        ...(prev.formData || {}),
        ...updates
      } as FormState;

      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Create stringified version for comparison
      const newDataString = JSON.stringify(newFormData);
      
      // Only save if data has actually changed
      if (newDataString !== lastSavedDataRef.current) {
        // Set a new timeout to save
        saveTimeoutRef.current = setTimeout(() => {
          const updatedForm = {
            ...savedForm,
            formState: newFormData,
            assessmentState: prev.assessments,
            isSubmitted: false,
            lastUpdated: Date.now()
          };
          
          console.log('[useFormState] Saving form data after debounce');
          formPersistence.saveForm(updatedForm);
          lastSavedDataRef.current = newDataString;
        }, 500); // Debounce for 500ms
      }

      return {
        ...prev,
        formData: newFormData
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