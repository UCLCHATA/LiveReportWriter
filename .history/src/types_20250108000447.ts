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
  progress?: number;
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

export interface AssessmentData {
  sensoryProfile: {
    type: 'sensoryProfile';
    domains: {
      visual: { value: number; observations: string[] };
      auditory: { value: number; observations: string[] };
      tactile: { value: number; observations: string[] };
      vestibular: { value: number; observations: string[] };
      proprioceptive: { value: number; observations: string[] };
      oral: { value: number; observations: string[] };
    };
  };
  socialCommunication: {
    type: 'socialCommunication';
    domains: {
      jointAttention: { value: number; observations: string[] };
      nonverbalCommunication: { value: number; observations: string[] };
      verbalCommunication: { value: number; observations: string[] };
      socialUnderstanding: { value: number; observations: string[] };
      playSkills: { value: number; observations: string[] };
      peerInteractions: { value: number; observations: string[] };
    };
  };
  behaviorInterests: {
    type: 'behaviorInterests';
    domains: {
      repetitiveBehaviors: { value: number; observations: string[] };
      routinesRituals: { value: number; observations: string[] };
      specialInterests: { value: number; observations: string[] };
      sensoryInterests: { value: number; observations: string[] };
      emotionalRegulation: { value: number; observations: string[] };
      flexibility: { value: number; observations: string[] };
    };
  };
  milestones: {
    type: 'milestoneTracker';
    milestones: any[];
    history: string;
  };
  assessmentLog: {
    type: 'assessmentLog';
    selectedAssessments: any[];
    entries: Record<string, any>;
  };
  progress?: number;
}

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
}

export const initialAssessments: AssessmentData = {
  sensoryProfile: {
    type: 'sensoryProfile',
    domains: {
      visual: { value: 0, observations: [] },
      auditory: { value: 0, observations: [] },
      tactile: { value: 0, observations: [] },
      vestibular: { value: 0, observations: [] },
      proprioceptive: { value: 0, observations: [] },
      oral: { value: 0, observations: [] }
    }
  },
  socialCommunication: {
    type: 'socialCommunication',
    domains: {
      jointAttention: { value: 0, observations: [] },
      nonverbalCommunication: { value: 0, observations: [] },
      verbalCommunication: { value: 0, observations: [] },
      socialUnderstanding: { value: 0, observations: [] },
      playSkills: { value: 0, observations: [] },
      peerInteractions: { value: 0, observations: [] }
    }
  },
  behaviorInterests: {
    type: 'behaviorInterests',
    domains: {
      repetitiveBehaviors: { value: 0, observations: [] },
      routinesRituals: { value: 0, observations: [] },
      specialInterests: { value: 0, observations: [] },
      sensoryInterests: { value: 0, observations: [] },
      emotionalRegulation: { value: 0, observations: [] },
      flexibility: { value: 0, observations: [] }
    }
  },
  milestones: {
    type: 'milestoneTracker',
    milestones: [],
    history: ''
  },
  assessmentLog: {
    type: 'assessmentLog',
    selectedAssessments: [],
    entries: {}
  }
}; 