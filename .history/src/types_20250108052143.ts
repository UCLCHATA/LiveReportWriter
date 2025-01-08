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

interface BaseDomain {
  value: number;
  observations: string[];
  name: string;
}

interface SensoryDomain extends BaseDomain {
  label: "Significantly Under-responsive" | "Under-responsive" | "Typical" | "Over-responsive" | "Significantly Over-responsive";
}

interface SocialDomain extends BaseDomain {
  label: "Age Appropriate" | "Subtle Differences" | "Emerging" | "Limited" | "Significantly Limited";
}

interface BehaviorDomain extends BaseDomain {
  label: "Not Present" | "Minimal Impact" | "Moderate Impact" | "Significant Impact" | "Severe Impact";
}

interface AssessmentBase {
  progress: number;
  isComplete?: boolean;
  lastUpdated?: string;
}

interface SensoryProfile extends AssessmentBase {
  type: 'sensoryProfile';
  domains: {
    visual: SensoryDomain;
    auditory: SensoryDomain;
    tactile: SensoryDomain;
    vestibular: SensoryDomain;
    proprioceptive: SensoryDomain;
    oral: SensoryDomain;
  };
}

interface SocialCommunication extends AssessmentBase {
  type: 'socialCommunication';
  domains: {
    jointAttention: SocialDomain;
    nonverbalCommunication: SocialDomain;
    verbalCommunication: SocialDomain;
    socialUnderstanding: SocialDomain;
    playSkills: SocialDomain;
    peerInteractions: SocialDomain;
  };
}

interface BehaviorInterests extends AssessmentBase {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: BehaviorDomain;
    routinesRituals: BehaviorDomain;
    specialInterests: BehaviorDomain;
    sensoryInterests: BehaviorDomain;
    emotionalRegulation: BehaviorDomain;
    flexibility: BehaviorDomain;
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