import { useState, useEffect } from 'react';
import { validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';

interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childName?: string;
  childAge?: string;
  childGender?: string;
}

interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: {
    referralReason: string;
    developmentalConcerns: string;
    medicalHistory: string;
    familyHistory: string;
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
  };
  assessments: {
    sensoryProfile: any | null;
    socialCommunication: any | null;
    behaviorInterests: any | null;
    milestones: any | null;
    assessmentLog: any | null;
  };
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

const initialFormData = {
  referralReason: '',
  developmentalConcerns: '',
  medicalHistory: '',
  familyHistory: '',
  status: 'draft' as const,
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

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
  },
  formData: initialFormData,
  assessments: {
    sensoryProfile: null,
    socialCommunication: null,
    behaviorInterests: null,
    milestones: null,
    assessmentLog: null
  },
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  const [validatedChataId, setValidatedChataId] = useState<string>('');

  // Save state to persistence service whenever it changes
  useEffect(() => {
    if (validatedChataId && globalState) {
      const stateToSave = {
        chataId: validatedChataId,
        clinicianInfo: {
          name: globalState.clinician.name,
          email: globalState.clinician.email,
          clinicName: globalState.clinician.clinicName,
          childName: globalState.clinician.childName,
          childAge: globalState.clinician.childAge,
          childGender: globalState.clinician.childGender,
        },
        formState: {
          status: globalState.status,
          ascStatus: globalState.formData.ascStatus,
          adhdStatus: globalState.formData.adhdStatus,
          referrals: globalState.formData.referrals,
          remarks: globalState.formData.remarks,
          clinicalObservations: globalState.formData.clinicalObservations,
          priorityAreas: globalState.formData.priorityAreas,
          strengths: globalState.formData.strengths,
          recommendations: globalState.formData.recommendations,
        },
        assessments: globalState.assessments,
        lastUpdated: Date.now(),
        isSubmitted: globalState.status === 'submitted'
      };
      formPersistence.saveForm(stateToSave);
    }
  }, [globalState, validatedChataId]);

  const checkExistingDraft = (chataId: string): GlobalFormState | null => {
    if (!validateChataId(chataId)) {
      console.log('Invalid CHATA ID format:', chataId);
      return null;
    }

    const savedForm = formPersistence.getForm(chataId);
    if (!savedForm || savedForm.isSubmitted) {
      console.log('No draft found for CHATA ID:', chataId);
      return null;
    }

    // Convert persistence format to global state format
    const restoredState: GlobalFormState = {
      chataId: savedForm.chataId,
      clinician: {
        name: savedForm.clinicianInfo.name,
        email: savedForm.clinicianInfo.email,
        clinicName: savedForm.clinicianInfo.clinicName,
        childName: savedForm.clinicianInfo.childName,
        childAge: savedForm.clinicianInfo.childAge,
        childGender: savedForm.clinicianInfo.childGender,
      },
      formData: {
        ...initialFormData,
        status: savedForm.formState.status,
        ascStatus: savedForm.formState.ascStatus,
        adhdStatus: savedForm.formState.adhdStatus,
        referrals: savedForm.formState.referrals,
        remarks: savedForm.formState.remarks,
        clinicalObservations: savedForm.formState.clinicalObservations,
        priorityAreas: savedForm.formState.priorityAreas,
        strengths: savedForm.formState.strengths,
        recommendations: savedForm.formState.recommendations,
      },
      assessments: savedForm.assessments,
      currentStep: 0, // Reset to start
      lastUpdated: new Date(savedForm.lastUpdated).toISOString(),
      status: savedForm.formState.status
    };

    console.log('Draft found and restored:', { chataId });
    return restoredState;
  };

  const restoreDraft = (chataId: string): GlobalFormState | null => {
    const draft = checkExistingDraft(chataId);
    if (draft) {
      setValidatedChataId(chataId);
      setGlobalState(draft);
      return draft;
    }
    return null;
  };

  const clearState = () => {
    if (validatedChataId) {
      formPersistence.deleteForm(validatedChataId);
    }
    setValidatedChataId('');
    setGlobalState(initialState);
  };

  const updateFormData = (updates: Partial<GlobalFormState['formData']>) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates
        },
        lastUpdated: new Date().toISOString()
      };
      return newState;
    });
  };

  const updateAssessment = (
    type: keyof GlobalFormState['assessments'],
    data: any
  ) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        assessments: {
          ...prev.assessments,
          [type]: data
        },
        lastUpdated: new Date().toISOString()
      };
      return newState;
    });
  };

  const setClinicianInfo = (info: ClinicianInfo) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        clinician: info,
        lastUpdated: new Date().toISOString()
      };
      return newState;
    });
  };

  return {
    globalState,
    setGlobalState,
    checkExistingDraft,
    restoreDraft,
    clearState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    validatedChataId
  };
};