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

export interface SensoryProfile extends AssessmentBase {
  type: 'sensoryProfile';
  domains: {
    visual: { value: number; observations: string[] };
    auditory: { value: number; observations: string[] };
    tactile: { value: number; observations: string[] };
    vestibular: { value: number; observations: string[] };
    proprioceptive: { value: number; observations: string[] };
    oral: { value: number; observations: string[] };
  };
}

export interface SocialCommunication extends AssessmentBase {
  type: 'socialCommunication';
  domains: {
    jointAttention: { value: number; observations: string[] };
    nonverbalCommunication: { value: number; observations: string[] };
    verbalCommunication: { value: number; observations: string[] };
    socialUnderstanding: { value: number; observations: string[] };
    playSkills: { value: number; observations: string[] };
    peerInteractions: { value: number; observations: string[] };
  };
}

export interface BehaviorInterests extends AssessmentBase {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: { value: number; observations: string[] };
    routinesRituals: { value: number; observations: string[] };
    specialInterests: { value: number; observations: string[] };
    sensoryInterests: { value: number; observations: string[] };
    emotionalRegulation: { value: number; observations: string[] };
    flexibility: { value: number; observations: string[] };
  };
}

export interface MilestoneTracker extends AssessmentBase {
  type: 'milestoneTracker';
  milestones: any[];
  history: string;
}

export interface AssessmentLog extends AssessmentBase {
  type: 'assessmentLog';
  selectedAssessments: any[];
  entries: Record<string, any>;
}

export interface AssessmentData {
  sensoryProfile: SensoryProfile;
  socialCommunication: SocialCommunication;
  behaviorInterests: BehaviorInterests;
  milestones: MilestoneTracker;
  assessmentLog: AssessmentLog;
}

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
} 