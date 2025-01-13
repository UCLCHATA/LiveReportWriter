export interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childFirstName: string;
  childLastName: string;
  childAge: string;
  childGender: string;
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