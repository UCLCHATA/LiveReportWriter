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

interface AssessmentDomain {
  value: number;
  observations: string[];
  name: string;
  label: string;
}

interface BaseAssessment {
  type: string;
  domains: {
    [key: string]: AssessmentDomain;
  };
  progress: number;
  isComplete?: boolean;
}

export interface SensoryProfileAssessment extends BaseAssessment {
  type: 'sensoryProfile';
  domains: {
    visual: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
    auditory: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
    tactile: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
    vestibular: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
    proprioceptive: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
    oral: AssessmentDomain & { label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' };
  };
}

export interface SocialCommunicationAssessment extends BaseAssessment {
  type: 'socialCommunication';
  domains: {
    jointAttention: AssessmentDomain;
    nonverbalCommunication: AssessmentDomain;
    verbalCommunication: AssessmentDomain;
    socialUnderstanding: AssessmentDomain;
    playSkills: AssessmentDomain;
    peerInteractions: AssessmentDomain;
  };
}

export interface BehaviorInterestsAssessment extends BaseAssessment {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: AssessmentDomain;
    routinesRituals: AssessmentDomain;
    specialInterests: AssessmentDomain;
    sensoryInterests: AssessmentDomain;
    emotionalRegulation: AssessmentDomain;
    flexibility: AssessmentDomain;
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
  sensoryProfile: SensoryProfileAssessment;
  socialCommunication: SocialCommunicationAssessment;
  behaviorInterests: BehaviorInterestsAssessment;
  milestones: MilestoneTracker;
  assessmentLog: AssessmentLog;
}

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
} 