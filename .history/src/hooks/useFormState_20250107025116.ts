import { useState, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';

type FormState = {
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

interface AssessmentData {
  sensoryProfile?: any;
  socialCommunication?: any;
  behaviorInterests?: any;
  milestones?: any;
  assessmentLog?: any;
}

interface GlobalState {
  chataId: string;
  formData: FormState | null;
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
    console.log('useFormState: Setting CHATA ID:', chataId);
    
    // Get saved form state
    const savedForm = formPersistence.getForm(chataId);
    console.log('useFormState: Retrieved saved form:', savedForm);
    
    // Update state with saved data or initialize new
    setGlobalState({
      chataId,
      formData: savedForm?.formState || {
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
      },
      assessments: savedForm?.assessmentState || initialAssessments
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => {
      if (!prev.chataId) {
        console.error('useFormState: No CHATA ID available for saving');
        return prev;
      }

      const newFormData = {
        ...prev.formData,
        ...updates
      } as FormState;

      // Save to persistence
      const savedForm = formPersistence.getForm(prev.chataId);
      if (savedForm?.clinicianInfo) {
        formPersistence.saveForm({
          chataId: prev.chataId,
          clinicianInfo: savedForm.clinicianInfo,
          formState: newFormData,
          assessmentState: prev.assessments,
          isSubmitted: false
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