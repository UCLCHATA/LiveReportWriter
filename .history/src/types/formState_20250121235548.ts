import type {
  ClinicianInfo as BaseClinicianInfo,
  FormData as BaseFormData,
  AssessmentData as BaseAssessmentData,
  GlobalFormState
} from './index';

export type ClinicianInfo = BaseClinicianInfo;
export type FormData = BaseFormData;
export type AssessmentData = BaseAssessmentData;

// Runtime state type
export interface RuntimeFormState {
  chataId: string;
  timestamp: number;
  clinician: ClinicianInfo;
  formData: FormData;
  assessments: Required<AssessmentData>;
  status: 'draft' | 'submitted';
  version: number;
}

// Persistence state type
export interface PersistenceFormState {
  chataId: string;
  timestamp: number;
  clinicianInfo: ClinicianInfo;
  formData: FormData;
  assessments: AssessmentData;
  isDirty: boolean;
  isSubmitted: boolean;
  version: number;
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

export interface FormData {
  status: 'draft' | 'submitted';
  ascStatus: string;
  adhdStatus: string;
  clinicalObservations: string;
  strengths: string;
  priorityAreas: string;
  recommendations: string;
  referrals: Record<string, boolean>;
  remarks: string;
  differentialDiagnosis: string;
  chartImage?: string;
  lastUpdated?: string;
  formProgress?: number;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
} 