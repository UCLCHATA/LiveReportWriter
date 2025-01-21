import type { FormState } from '../types';

// Base types
export interface ClinicianInfo {
<<<<<<< HEAD
  chataId: string;
  clinicName: string;
  name: string;
  email: string;
  childFirstName: string;
  childSecondName?: string;
  childAge?: string;
  childGender?: string;
}

export interface AppsScriptResponse {
  success: boolean;
  error?: string;
  documentUrl?: string;
  emailStatus?: string;
  progress?: {
    details?: {
      documentUrl?: string;
      emailStatus?: {
        sent: boolean;
        recipientEmail?: string;
        error?: string;
      };
    };
  };
=======
  clinicianName: string;
  clinicianEmail: string;
  clinicName: string;
  childFirstName: string;
  childSecondName: string;
  childAge: string;
  childGender: string;
>>>>>>> fix-deployment
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
<<<<<<< HEAD
  differentialDiagnosis?: string;
  milestones?: Milestone[];
  milestoneHistory?: string;
  timelineImage?: string;
  radarChartImage?: string;
  assessments?: Assessment[];
  milestoneImage?: string;
  combinedGraphImage?: string;
  includeMilestoneImage?: boolean;
  includeRadarChart?: boolean;
=======
  chartImage?: string;
  differentialDiagnosis: string;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
>>>>>>> fix-deployment
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
  title: string;
  category: 'communication' | 'motor' | 'social' | 'concerns';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: 'typical' | 'monitor' | 'delayed' | 'pending' | 'advanced';
  isCustom?: boolean;
  difference?: number;
}

export interface MilestoneTrackerData {
  type: 'milestoneTracker';
  milestones: Milestone[];
  currentMilestones: Milestone[];
  customMilestones: Milestone[];
  history: string;
  progress: number;
  formProgress: number;
  isComplete: boolean;
  lastUpdated: string;
<<<<<<< HEAD
  timelineImage?: string;
  includeTimelineInReport?: boolean;
=======
  historyOfConcerns?: string;
>>>>>>> fix-deployment
}

export interface AssessmentEntry {
  name: string;
  date: string;
  notes: string;
  status?: 'completed' | 'pending';
}

export interface AssessmentLogData {
  date?: string;
  notes?: string;
  status?: string;
}

export interface AssessmentSummaryData {
<<<<<<< HEAD
  type: 'summary';
  progress: number;
  isComplete: boolean;
  lastUpdated: string;
  includeInReport?: boolean;
  radarChartImage?: string;
}

export interface AssessmentData {
  sensoryProfile: SensoryProfileData;
  socialCommunication: SocialCommunicationData;
  behaviorInterests: BehaviorInterestsData;
  milestones: MilestoneTrackerData;
  assessmentLog: AssessmentLogData;
  summary?: AssessmentSummaryData;
}

export interface GlobalFormState {
  chataId?: string;
  clinician?: ClinicianInfo;
  formData: FormData;
  assessments: {
    sensoryProfile: {
      type: 'sensoryProfile';
      domains: Record<string, { value?: string; observations?: string; }>;
      progress: number;
      isComplete: boolean;
    };
    socialCommunication: {
      type: 'socialCommunication';
      domains: Record<string, { value?: string; observations?: string; }>;
      progress: number;
      isComplete: boolean;
    };
    behaviorInterests: {
      type: 'behaviorInterests';
      domains: Record<string, { value?: string; observations?: string; }>;
      progress: number;
      isComplete: boolean;
    };
    assessmentLog: {
      type: 'assessmentLog';
      entries: Record<string, AssessmentEntry>;
      progress: number;
      isComplete: boolean;
    };
    milestones: MilestoneTrackerData;
    summary?: AssessmentSummaryData;
  };
=======
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
>>>>>>> fix-deployment
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

export interface Assessment {
  id: string;
  type: string;
  date: string;
  notes?: string;
  domains?: Record<string, number>;
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