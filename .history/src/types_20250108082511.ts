export type FormState = {
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
  formProgress: number;
  lastUpdated?: string;
};

export interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childName: string;
  childAge: string;
  childGender: string;
  chataId?: string;
}

interface AssessmentBase {
  progress: number;
}

export interface AssessmentDomainBase {
  name: string;
  value: number;
  observations: string[];
}

export interface SensoryDomain extends AssessmentDomainBase {
  label: "Significantly Under-responsive" | "Under-responsive" | "Typical" | "Over-responsive" | "Significantly Over-responsive";
}

export interface SocialCommunicationDomain extends AssessmentDomainBase {
  label: "Age Appropriate" | "Subtle Differences" | "Emerging" | "Limited" | "Significantly Limited";
}

export interface BehaviorDomain extends AssessmentDomainBase {
  label: "Not Present" | "Minimal Impact" | "Moderate Impact" | "Significant Impact" | "Severe Impact";
}

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

export interface MilestoneTrackerData {
  type: 'milestoneTracker';
  milestones: Milestone[];
  customMilestones: Milestone[];
  history: string;
  progress: number;
  formProgress: number;
  isComplete: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social' | 'concerns';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: 'typical' | 'monitor' | 'delayed' | 'pending';
}

export interface AssessmentLogData {
  type: 'assessmentLog';
  selectedAssessments: any[];
  entries: Record<string, any>;
  progress: number;
  isComplete: boolean;
}

export interface AssessmentData {
  sensoryProfile: SensoryProfileData;
  socialCommunication: SocialCommunicationData;
  behaviorInterests: BehaviorInterestsData;
  milestones: MilestoneTrackerData;
  assessmentLog: AssessmentLogData;
}

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
} 