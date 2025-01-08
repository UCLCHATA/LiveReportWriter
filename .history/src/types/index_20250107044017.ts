export interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childName?: string;
  childAge?: string;
  childGender?: string;
  chataId?: string;
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
  differentialDiagnosis?: string;
  lastUpdated?: string;
}

export interface AssessmentData {
  sensoryProfile: any; // Will be replaced with specific type
  socialCommunication: any;
  behaviorInterests: any;
  milestones: any;
  assessmentLog: any;
}

export interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: FormData;
  assessments: AssessmentData;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

export interface FormProgress {
  formProgress: number;
  carouselProgress: number;
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
      socialReciprocity: { value: 0, observations: [] },
      nonverbalCommunication: { value: 0, observations: [] },
      verbalCommunication: { value: 0, observations: [] },
      playSkills: { value: 0, observations: [] }
    }
  },
  behaviorInterests: {
    type: 'behaviorInterests',
    domains: {
      repetitiveBehaviors: { value: 0, observations: [] },
      routinesRituals: { value: 0, observations: [] },
      specialInterests: { value: 0, observations: [] },
      sensoryBehaviors: { value: 0, observations: [] },
      emotionalRegulation: { value: 0, observations: [] }
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