export interface ClinicianInfo {
  name: string;
  email: string;
}

export interface FormStatus {
  isDraft: boolean;
  lastSaved: string;
  isAutosaved: boolean;
}

export interface AssessmentData {
  referralReason: string;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
  clinicalObservations: string;
  priorityAreas: string;
  strengths: string;
  recommendations: string;
  status: {
    asc: string;
    adhd: string;
  };
  referrals: {
    speech: boolean;
    educational: boolean;
    sleep: boolean;
    occupational: boolean;
    mental: boolean;
    other: boolean;
  };
  remarks: string;
}

export interface ComponentData {
  sensoryProfile: any;
  socialCommunication: any;
  behaviorInterests: any;
  milestoneTracker: any;
  assessmentLog: any;
}

export interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  assessmentData: AssessmentData;
  componentData: ComponentData;
  formStatus: FormStatus;
  currentStep: number;
} 