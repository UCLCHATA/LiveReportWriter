import type { FormState } from '../types';

// Base types
export interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childFirstName?: string;
  childLastName?: string;
  childAge?: string;
  childGender?: string;
  chataId?: string;
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
}

// Assessment types
export interface AssessmentDomainBase<T = string> {
  name: string;
  value: number;
  observations: string[];
  label: T;
}

export interface SensoryDomain extends AssessmentDomainBase<"Significantly Under-responsive" | "Under-responsive" | "Typical" | "Over-responsive" | "Significantly Over-responsive"> {}

export interface SocialCommunicationDomain extends AssessmentDomainBase<"Age Appropriate" | "Subtle Differences" | "Emerging" | "Limited" | "Significantly Limited"> {}

export interface BehaviorDomain extends AssessmentDomainBase<"Not Present" | "Minimal Impact" | "Moderate Impact" | "Significant Impact" | "Severe Impact"> {}

export interface SensoryProfileData {
  type: 'sensoryProfile';
  domains: {
    visual: SensoryDomain;
    auditory: SensoryDomain;
    tactile: SensoryDomain;
    vestibular: SensoryDomain;
    proprioceptive: SensoryDomain;
    oral: SensoryDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface SocialCommunicationData {
  type: 'socialCommunication';
  domains: {
    jointAttention: SocialCommunicationDomain;
    nonverbalCommunication: SocialCommunicationDomain;
    verbalCommunication: SocialCommunicationDomain;
    socialUnderstanding: SocialCommunicationDomain;
    playSkills: SocialCommunicationDomain;
    peerInteractions: SocialCommunicationDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface BehaviorInterestsData {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: BehaviorDomain;
    routinesRituals: BehaviorDomain;
    specialInterests: BehaviorDomain;
    sensoryInterests: BehaviorDomain;
    emotionalRegulation: BehaviorDomain;
    flexibility: BehaviorDomain;
  };
  progress: number;
  isComplete: boolean;
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
  type: 'assessmentLog';
  selectedAssessments: string[];
  entries: Record<string, AssessmentEntry>;
  progress: number;
  isComplete: boolean;
}

export interface AssessmentSummaryData {
  type: 'summary';
  progress: number;
  isComplete: boolean;
  lastUpdated: string;
}

export interface AssessmentData {
  sensoryProfile: SensoryProfileData;
  socialCommunication: SocialCommunicationData;
  behaviorInterests: BehaviorInterestsData;
  milestones: MilestoneTrackerData;
  assessmentLog: AssessmentLogData;
  summary: AssessmentSummaryData;
}

export interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
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