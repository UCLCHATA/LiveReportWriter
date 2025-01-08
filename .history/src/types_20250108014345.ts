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

interface Domain {
  value: number;
  observations: string[];
  name?: string;
  label?: string;
}

interface AssessmentBase {
  progress: number;
  isComplete?: boolean;
  lastUpdated?: string;
}

interface SensoryProfile extends AssessmentBase {
  type: 'sensoryProfile';
  domains: {
    visual: Domain;
    auditory: Domain;
    tactile: Domain;
    vestibular: Domain;
    proprioceptive: Domain;
    oral: Domain;
  };
}

interface SocialCommunication extends AssessmentBase {
  type: 'socialCommunication';
  domains: {
    jointAttention: Domain;
    nonverbalCommunication: Domain;
    verbalCommunication: Domain;
    socialUnderstanding: Domain;
    playSkills: Domain;
    peerInteractions: Domain;
  };
}

interface BehaviorInterests extends AssessmentBase {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: Domain;
    routinesRituals: Domain;
    specialInterests: Domain;
    sensoryInterests: Domain;
    emotionalRegulation: Domain;
    flexibility: Domain;
  };
}

interface MilestoneTracker extends AssessmentBase {
  type: 'milestoneTracker';
  milestones: Array<{
    id: string;
    name: string;
    expectedAge: number;
    actualAge?: number;
    category: string;
  }>;
  history: string;
}

interface AssessmentLog extends AssessmentBase {
  type: 'assessmentLog';
  selectedAssessments: Array<{
    id: string;
    name: string;
    date?: string;
  }>;
  entries: Record<string, {
    date?: string;
    notes?: string;
  }>;
}

export type AssessmentData = {
  sensoryProfile: SensoryProfile;
  socialCommunication: SocialCommunication;
  behaviorInterests: BehaviorInterests;
  milestones: MilestoneTracker;
  assessmentLog: AssessmentLog;
};

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
} 