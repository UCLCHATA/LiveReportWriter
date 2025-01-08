import { useState, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';

interface FormData {
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  lastUpdated: string;
  status?: 'draft' | 'submitted';
  ascStatus?: string;
  adhdStatus?: string;
  referrals?: {
    speech: boolean;
    educational: boolean;
    sleep: boolean;
    occupational: boolean;
    mental: boolean;
    other: boolean;
  };
  remarks?: string;
  clinicalObservations?: string;
  priorityAreas?: string;
  strengths?: string;
  recommendations?: string;
  differentialDiagnosis?: string;
}

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
      } as FormData;

      // Save to persistence with full form data
      if (newFormData.clinicianInfo) {
        formPersistence.saveForm({
          chataId: prev.chataId,
          formState: newFormData,
          assessmentState: prev.assessments,
          lastUpdated: Date.now(),
          isSubmitted: false,
          clinicianInfo: newFormData.clinicianInfo
        });
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