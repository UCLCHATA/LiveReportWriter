import { useState, useEffect } from 'react';
import { validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';

interface ClinicianInfo {
  name: string;
  email: string;
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
    differentialDiagnosis?: string;
  };
  assessments: {
    sensoryProfile: any | null;
    socialCommunication: any | null;
    behaviorInterests: any | null;
    milestones: any | null;
    assessmentLog: any | null;
  };
  currentStep: number;
  status: 'draft' | 'submitted';
  progress: {
    form: number;
    carousel: number;
  };
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
  recommendations: '',
  differentialDiagnosis: ''
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: ''
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
  status: 'draft',
  progress: {
    form: 0,
    carousel: 0
  }
};

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<GlobalFormState>(initialState);
  const [validatedChataId, setValidatedChataId] = useState<string>('');

  useEffect(() => {
    if (validatedChataId) {
      const form = formPersistence.getForm(validatedChataId);
      if (form) {
        setGlobalState(prev => ({
          ...prev,
          chataId: validatedChataId,
          clinician: {
            name: form.clinicianInfo.name,
            email: form.clinicianInfo.email
          },
          formData: {
            ...prev.formData,
            status: form.isSubmitted ? 'submitted' : 'draft'
          }
        }));
      }
    }
  }, [validatedChataId]);

  useEffect(() => {
    if (validatedChataId && globalState) {
      formPersistence.saveForm({
        chataId: validatedChataId,
        clinicianInfo: {
          name: globalState.clinician.name,
          email: globalState.clinician.email,
          clinicName: '',
          childName: '',
          childAge: '',
          childGender: ''
        },
        lastUpdated: Date.now(),
        isSubmitted: globalState.status === 'submitted'
      });
    }
  }, [globalState, validatedChataId]);

  const checkExistingDraft = (chataId: string): GlobalFormState | null => {
    if (!validateChataId(chataId)) {
      throw new Error('Invalid CHATA ID format (e.g., KOS-JOH-123 for Kevin Smith and John)');
    }
    const form = formPersistence.getForm(chataId);
    if (form && !form.isSubmitted) {
      return {
        ...initialState,
        chataId,
        clinician: {
          name: form.clinicianInfo.name,
          email: form.clinicianInfo.email
        },
        status: 'draft'
      };
    }
    return null;
  };

  const restoreDraft = (chataId: string): GlobalFormState | null => {
    try {
      const draft = checkExistingDraft(chataId);
      if (draft) {
        setValidatedChataId(chataId);
        setGlobalState(draft);
        return draft;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const clearState = () => {
    if (validatedChataId) {
      formPersistence.markAsSubmitted(validatedChataId);
    }
    setValidatedChataId('');
    setGlobalState(initialState);
  };

  const updateFormData = (updates: Partial<GlobalFormState['formData']>) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates
      }
    }));
  };

  const updateAssessment = (
    type: keyof GlobalFormState['assessments'],
    data: any
  ) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      assessments: {
        ...prev.assessments,
        [type]: data
      }
    }));
  };

  const setClinicianInfo = (info: ClinicianInfo) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      clinician: info
    }));
  };

  const updateProgress = (formProgress?: number, carouselProgress?: number) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      progress: {
        form: formProgress ?? prev.progress.form,
        carousel: carouselProgress ?? prev.progress.carousel
      }
    }));
  };

  const setChataId = (chataId: string) => {
    if (!validateChataId(chataId)) {
      throw new Error('Invalid CHATA ID format (e.g., KOS-JOH-123 for Kevin Smith and John)');
    }
    setValidatedChataId(chataId);
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      chataId
    }));
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
    updateProgress,
    setChataId,
    validatedChataId
  };
};