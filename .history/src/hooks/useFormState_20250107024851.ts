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
    
    // Get saved form state first
    const savedForm = formPersistence.getForm(chataId);
    console.log('useFormState: Retrieved saved form:', savedForm);
    
    if (savedForm?.formState) {
      console.log('useFormState: Restoring saved form state for:', chataId);
      // Update state in a single operation with saved data
      const formState: FormState = {
        status: savedForm.formState.status || 'draft',
        ascStatus: savedForm.formState.ascStatus || '',
        adhdStatus: savedForm.formState.adhdStatus || '',
        referrals: savedForm.formState.referrals || {
          speech: false,
          educational: false,
          sleep: false,
          occupational: false,
          mental: false,
          other: false
        },
        remarks: savedForm.formState.remarks || '',
        clinicalObservations: savedForm.formState.clinicalObservations || '',
        priorityAreas: savedForm.formState.priorityAreas || '',
        strengths: savedForm.formState.strengths || '',
        recommendations: savedForm.formState.recommendations || ''
      };
      
      setGlobalState({
        chataId,
        formData: formState,
        assessments: savedForm.assessmentState || initialAssessments
      });
      console.log('useFormState: State updated with saved form data');
    } else {
      console.log('useFormState: Initializing with default state for:', chataId);
      // Initialize with default state
      setGlobalState({
        chataId,
        formData: {
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
        assessments: initialAssessments
      });
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    console.log('useFormState: Updating form data:', updates);
    setGlobalState(prev => {
      if (!prev.chataId) {
        console.error('useFormState: No CHATA ID available for saving');
        return prev;
      }

      const newFormData = {
        ...prev.formData,
        ...updates
      } as FormState;

      console.log('useFormState: New form data:', newFormData);

      // Save to persistence with full form data
      const savedForm = formPersistence.getForm(prev.chataId);
      if (savedForm?.clinicianInfo) {
        const updatedForm = {
          chataId: prev.chataId,
          clinicianInfo: savedForm.clinicianInfo,
          formState: newFormData,
          assessmentState: prev.assessments,
          lastUpdated: Date.now(),
          isSubmitted: false
        };
        formPersistence.saveForm(updatedForm);
        console.log('useFormState: Saved form data successfully:', prev.chataId);
      } else {
        console.error('useFormState: Could not save form - missing clinician info for:', prev.chataId);
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