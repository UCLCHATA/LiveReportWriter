export interface ClinicianInfo {
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
}

export interface FormData {
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
  formProgress: number;
  lastUpdated: string;
  differentialDiagnosis?: string;
  milestones?: Milestone[];
  milestoneHistory?: string;
  timelineImage?: string;
  radarChartImage?: string;
}

// Base interface for all assessment domains
export interface AssessmentDomainBase {
  name: string;
  value: number;
  observations: string[];
  label: string;
}

export interface SensoryProfileData {
  type: 'sensoryProfile';
  domains: {
    visual: AssessmentDomainBase;
    auditory: AssessmentDomainBase;
    tactile: AssessmentDomainBase;
    vestibular: AssessmentDomainBase;
    proprioceptive: AssessmentDomainBase;
    oral: AssessmentDomainBase;
  };
  progress: number;
  isComplete: boolean;
}

export interface SocialCommunicationData {
  type: 'socialCommunication';
  domains: {
    jointAttention: AssessmentDomainBase;
    nonverbalCommunication: AssessmentDomainBase;
    verbalCommunication: AssessmentDomainBase;
    socialUnderstanding: AssessmentDomainBase;
    playSkills: AssessmentDomainBase;
    peerInteractions: AssessmentDomainBase;
  };
  progress: number;
  isComplete: boolean;
}

export interface BehaviorInterestsData {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: AssessmentDomainBase;
    routinesRituals: AssessmentDomainBase;
    specialInterests: AssessmentDomainBase;
    sensoryInterests: AssessmentDomainBase;
    emotionalRegulation: AssessmentDomainBase;
    flexibility: AssessmentDomainBase;
  };
  progress: number;
  isComplete: boolean;
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
  timelineImage?: string;
  includeTimelineInReport?: boolean;
}

export interface AssessmentEntry {
  name: string;
  date: string;
  notes: string;
  status?: 'completed' | 'pending';
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