import { ClinicianInfo, AssessmentLogData, AssessmentData, AssessmentSummaryData } from './types/index';

export interface FormState {
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
  componentProgress: {
    [key: string]: {
      progress: number;
      isComplete: boolean;
    }
  };
  remarks: string;
  clinicalObservations: string;
  priorityAreas: string;
  strengths: string;
  recommendations: string;
  formProgress: number;
  lastUpdated: string;
  chartImage?: string;
  differentialDiagnosis: string;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
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

export interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  color: string;
  category: string;
  selected?: boolean;
  status?: 'pending' | 'completed' | 'scheduled';
  addedAt?: string;
  lastModified?: string;
}

export function isAssessment(data: any): data is Assessment {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    (data.date === undefined || typeof data.date === 'string') &&
    (data.notes === undefined || typeof data.notes === 'string') &&
    (data.status === undefined || ['pending', 'completed', 'scheduled'].includes(data.status)) &&
    typeof data.color === 'string' &&
    typeof data.category === 'string'
  );
}

export function isAssessmentLogData(data: any): data is AssessmentLogData {
  return (
    data &&
    data.type === 'assessmentLog' &&
    Array.isArray(data.selectedAssessments) &&
    data.selectedAssessments.every(isAssessment) &&
    typeof data.entries === 'object' &&
    Object.values(data.entries).every(isAssessment) &&
    typeof data.progress === 'number' &&
    typeof data.isComplete === 'boolean'
  );
}

export interface GlobalFormState {
    chataId: string;
    clinician?: {
        name: string;
        email: string;
        clinicName: string;
        childFirstName: string;
        childLastName: string;
        childAge: string;
        childGender: string;
    };
    formData: {
        ascStatus: string;
        adhdStatus: string;
        clinicalObservations: string;
        strengths: string;
        priorityAreas: string;
        recommendations: string;
        remarks?: string;
        differentialDiagnosis?: string;
        referrals?: Record<string, boolean>;
        [key: string]: any;
    };
    assessments?: {
        sensoryProfile?: any;
        socialCommunication?: any;
        behaviorInterests?: any;
        milestones?: {
            milestones: any[];
            historyOfConcerns?: string;
        };
        assessmentLog?: Record<string, any>;
    };
} 