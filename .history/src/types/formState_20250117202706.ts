import type {
  ClinicianInfo,
  FormData,
  AssessmentData,
  GlobalFormState
} from './index';

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