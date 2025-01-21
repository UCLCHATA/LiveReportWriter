import type { FormState } from '../types';

// Base types
export interface ClinicianInfo {
  clinicianName: string;
  clinicianEmail: string;
  clinicName: string;
  childFirstName: string;
  childSecondName: string;
  childAge: string;
  childGender: string;
}

export interface FormData {
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
  formProgress: number;
  lastUpdated: string;
  chartImage?: string;
  differentialDiagnosis: string;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
}

// Assessment types
export interface AssessmentDomainBase<T = string> {
  value?: number;
  label?: T;
  notes?: string;
  observations?: string[];
}

export type SensoryDomain = AssessmentDomainBase<"Significantly Under-responsive" | "Under-responsive" | "Typical" | "Over-responsive" | "Significantly Over-responsive">;
export type SocialCommunicationDomain = AssessmentDomainBase<"Age Appropriate" | "Subtle Differences" | "Emerging" | "Limited" | "Significantly Limited">;
export type BehaviorDomain = AssessmentDomainBase<"Not Present" | "Minimal Impact" | "Moderate Impact" | "Significant Impact" | "Severe Impact">;

export interface Assessment {
  id: string;
  name: string;
  value?: number;
  label?: string;
  notes?: string;
  observations?: string[];
  domains?: Record<string, AssessmentDomainBase>;
}

export interface SensoryProfileData {
  domains: Record<string, SensoryDomain>;
}

export interface SocialCommunicationData {
  domains: Record<string, SocialCommunicationDomain>;
}

export interface BehaviorInterestsData {
  domains: Record<string, BehaviorDomain>;
}

export interface Milestone {
  id: string;
  category: string;
  description: string;
  ageRange: string;
  isAchieved: boolean;
  achievedDate?: string;
  notes?: string;
}

export interface MilestoneTrackerData {
  type: 'milestoneTracker';
  milestones: Milestone[];
  customMilestones: Milestone[];
  history: string;
  progress: number;
  formProgress: number;
  isComplete: boolean;
  lastUpdated: string;
  historyOfConcerns?: string;
}

export interface AssessmentEntry {
  id: string;
  name: string;
  date: string;
  provider: string;
  summary: string;
  recommendations: string;
  attachments?: string[];
}

export interface AssessmentLogData {
  date?: string;
  notes?: string;
  status?: string;
}

export interface AssessmentSummaryData {
  notes?: string;
  recommendations?: string[];
}

export interface AssessmentData {
  sensoryProfile?: SensoryProfileData;
  socialCommunication?: SocialCommunicationData;
  behaviorInterests?: BehaviorInterestsData;
  milestones?: any[];
  assessmentLog?: Record<string, any>;
  summary?: any;
}

export interface GlobalFormState {
  chataId: string;
  clinician: Partial<ClinicianInfo>;
  formData: FormData;
  assessments: Required<AssessmentData>;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

// Type guards
export const isMilestone = (obj: any): obj is Milestone => {
  return obj && typeof obj === 'object' && 'id' in obj && 'category' in obj;
};

export const isMilestoneTrackerData = (obj: any): obj is MilestoneTrackerData => {
  return obj && typeof obj === 'object' && obj.type === 'milestoneTracker';
};

export const isAssessmentEntry = (obj: any): obj is AssessmentEntry => {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
};

export const isAssessmentLogData = (obj: any): obj is AssessmentLogData => {
  return obj && typeof obj === 'object' && obj.type === 'assessmentLog';
}; 