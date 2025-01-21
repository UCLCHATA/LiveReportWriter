import { useState, useEffect, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';

interface FormState {
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  formState?: {
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
    differentialDiagnosis?: string;
  };
  assessmentState?: {
    sensoryProfile?: any;
    socialCommunication?: any;
    behaviorInterests?: any;
    milestones?: any;
    assessmentLog?: any;
  };
  progress: {
    formProgress: number;
    carouselProgress: number;
  };
}

export const useFormPersistence = (chataId: string) => {
  const [formState, setFormState] = useState<FormState | null>(null);

  // Load form state when component mounts or chataId changes
  useEffect(() => {
    if (chataId) {
      const savedForm = formPersistence.getForm(chataId);
      if (savedForm) {
        setFormState({
          clinicianInfo: savedForm.clinicianInfo,
          formState: savedForm.formState,
          assessmentState: savedForm.assessmentState,
          progress: savedForm.progress || { formProgress: 0, carouselProgress: 0 }
        });
      }
    }
  }, [chataId]);

  // Save the entire form state
  const saveForm = useCallback((newState: Partial<FormState>) => {
    if (!chataId || !formState) return;

    const updatedState: FormState = {
      ...formState,
      ...newState,
    };

    setFormState(updatedState);
    formPersistence.saveForm({
      chataId,
      clinicianInfo: updatedState.clinicianInfo,
      formState: updatedState.formState,
      assessmentState: updatedState.assessmentState,
      progress: updatedState.progress,
      lastUpdated: Date.now(),
      isSubmitted: false
    });
  }, [chataId, formState]);

  // Update progress specifically
  const updateProgress = useCallback((formProgress: number, carouselProgress: number) => {
    if (!chataId || !formState) return;

    const progress = { formProgress, carouselProgress };
    saveForm({ progress });
  }, [chataId, formState, saveForm]);

  // Mark form as submitted
  const submitForm = useCallback(() => {
    if (!chataId) return;
    formPersistence.markAsSubmitted(chataId);
    setFormState(null);
  }, [chataId]);

  // Clear form state
  const clearForm = useCallback(() => {
    if (!chataId) return;
    setFormState(null);
  }, [chataId]);

  return {
    formState,
    saveForm,
    updateProgress,
    submitForm,
    clearForm
  };
}; 