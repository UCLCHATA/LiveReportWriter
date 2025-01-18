import { useState, useEffect, useCallback } from 'react';
import type { 
  ClinicianInfo, 
  AssessmentData,
  GlobalFormState,
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  MilestoneTrackerData,
  AssessmentLogData,
  AssessmentSummaryData,
  FormData
} from '../types/index';

// Initialize form persistence service
const formPersistence = new (class FormPersistenceService {
  getStoredForm() { return null; }
  saveForm(form: any) { }
  clearForm() { }
})();

// Add back initial state and validation
const initialFormData: FormData = {
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
  recommendations: '',
  formProgress: 0,
  lastUpdated: new Date().toISOString(),
  differentialDiagnosis: '',
  developmentalConcerns: '',
  medicalHistory: '',
  familyHistory: ''
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
    childFirstName: '',
    childLastName: '',
    childAge: '',
    childGender: ''
  },
  formData: initialFormData,
  assessments: {
    sensoryProfile: {} as SensoryProfileData,
    socialCommunication: {} as SocialCommunicationData,
    behaviorInterests: {} as BehaviorInterestsData,
    milestoneTracker: {} as MilestoneTrackerData,
    assessmentLog: {} as AssessmentLogData,
    assessmentSummary: {} as AssessmentSummaryData
  }
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  
  // Load initial state from persistence service
  useEffect(() => {
    const storedForm = formPersistence.getStoredForm();
    if (storedForm) {
      setGlobalState(prev => ({
        ...prev,
        chataId: storedForm.chataId,
        clinician: storedForm.clinicianInfo,
        formData: storedForm.formData || initialFormData,
        assessments: storedForm.assessments || initialState.assessments
      }));
    }
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    console.log('🔄 Setting clinician info:', info);
    if (!info.name || !info.email || !info.clinicName) {
      console.error('Missing required clinician fields:', {
        name: !!info.name,
        email: !!info.email,
        clinicName: !!info.clinicName
      });
      return;
    }
    
    setGlobalState(prev => {
      const newState = {
        ...prev,
        clinician: {
          name: info.name,
          email: info.email,
          clinicName: info.clinicName,
          childFirstName: info.childFirstName || prev.clinician?.childFirstName || '',
          childLastName: info.childLastName || prev.clinician?.childLastName || '',
          childAge: info.childAge || prev.clinician?.childAge || '',
          childGender: info.childGender || prev.clinician?.childGender || '',
          chataId: info.chataId || prev.chataId
        },
        chataId: info.chataId || prev.chataId
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: newState.chataId,
        clinicianInfo: newState.clinician,
        formData: prev.formData,
        assessments: prev.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates,
          lastUpdated: new Date().toISOString()
        }
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: prev.chataId,
        clinicianInfo: prev.clinician,
        formData: newState.formData,
        assessments: prev.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const updateAssessment = useCallback((
    domain: keyof GlobalFormState['assessments'],
    data: AssessmentData
  ) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        assessments: {
          ...prev.assessments,
          [domain]: data
        }
      };

      // Save to form persistence service
      formPersistence.saveForm({
        chataId: prev.chataId,
        clinicianInfo: prev.clinician,
        formData: prev.formData,
        assessments: newState.assessments,
        lastUpdated: Date.now(),
        isSubmitted: false,
        isDirty: true
      });

      return newState;
    });
  }, []);

  const clearState = useCallback(() => {
    formPersistence.clearForm();
    setGlobalState(initialState);
  }, []);

  return {
    globalState,
    setGlobalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};