import type {
  ClinicianInfo as BaseClinicianInfo,
  FormData as BaseFormData,
  AssessmentData as BaseAssessmentData,
  GlobalFormState
} from './index';

export type {
  ClinicianInfo,
  AssessmentData
};

export interface BaseFormData {
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
  referralNotes?: string;
  componentProgress?: Record<string, { progress: number; isComplete: boolean }>;
}

export interface FormData extends BaseFormData {
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
}

// Runtime state type
export interface RuntimeFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: FormData;
  assessments: Required<AssessmentData>;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

// Persistence state type
export interface PersistenceFormState extends RuntimeFormState {
  version: number;
  createdAt: string;
  updatedAt: string;
}

// API submission type
export interface SheetySubmissionData {
  chataId: string;
  timestamp: string;
  clinicianName: string;
  clinicianEmail: string;
  clinicName: string;
  childInfo: string;
  formData: string;
  assessments: string;
}

export interface GlobalFormState extends RuntimeFormState {
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
} 