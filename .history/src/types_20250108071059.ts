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

export interface AssessmentDomain {
  name: string;
  value: number;
  observations: string[];
  label: string;
}

export interface SensoryProfileData {
  type: 'sensoryProfile';
  domains: {
    visual: AssessmentDomain;
    auditory: AssessmentDomain;
    tactile: AssessmentDomain;
    vestibular: AssessmentDomain;
    proprioceptive: AssessmentDomain;
    oral: AssessmentDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface SocialCommunicationData {
  type: 'socialCommunication';
  domains: {
    jointAttention: AssessmentDomain;
    nonverbalCommunication: AssessmentDomain;
    verbalCommunication: AssessmentDomain;
    socialUnderstanding: AssessmentDomain;
    playSkills: AssessmentDomain;
    peerInteractions: AssessmentDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface BehaviorInterestsData {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: AssessmentDomain;
    routinesRituals: AssessmentDomain;
    specialInterests: AssessmentDomain;
    sensoryInterests: AssessmentDomain;
    emotionalRegulation: AssessmentDomain;
    flexibility: AssessmentDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface MilestoneTrackerData {
  type: 'milestoneTracker';
  milestones: any[];
  history: string;
  progress: number;
  isComplete: boolean;
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