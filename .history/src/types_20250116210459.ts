import { ClinicianInfo, GlobalFormState, AssessmentLogData, AssessmentData, AssessmentSummaryData } from './types/index';

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

export interface SensoryProfileData {
  type: 'sensoryProfile';
  domains: {
    visual: SensoryDomain;
    auditory: SensoryDomain;
    tactile: SensoryDomain;
    vestibular: SensoryDomain;
    proprioceptive: SensoryDomain;
    oral: SensoryDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface SocialCommunicationData {
  type: 'socialCommunication';
  domains: {
    jointAttention: SocialCommunicationDomain;
    nonverbalCommunication: SocialCommunicationDomain;
    verbalCommunication: SocialCommunicationDomain;
    socialUnderstanding: SocialCommunicationDomain;
    playSkills: SocialCommunicationDomain;
    peerInteractions: SocialCommunicationDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface BehaviorInterestsData {
  type: 'behaviorInterests';
  domains: {
    repetitiveBehaviors: BehaviorDomain;
    routinesRituals: BehaviorDomain;
    specialInterests: BehaviorDomain;
    sensoryInterests: BehaviorDomain;
    emotionalRegulation: BehaviorDomain;
    flexibility: BehaviorDomain;
  };
  progress: number;
  isComplete: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social' | 'concerns';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: 'typical' | 'monitor' | 'delayed' | 'pending';
}

export interface MilestoneTrackerData {
  type: 'milestoneTracker';
  milestones: Milestone[];
  customMilestones: Milestone[];
  history: string;
  progress: number;
  formProgress: number;
  isComplete: boolean;
  lastUpdated: string;
}

export function isMilestoneTrackerData(obj: any): obj is MilestoneTrackerData {
  return (
    obj &&
    obj.type === 'milestoneTracker' &&
    Array.isArray(obj.milestones) &&
    obj.milestones.every(isMilestone) &&
    Array.isArray(obj.customMilestones) &&
    obj.customMilestones.every(isMilestone) &&
    typeof obj.history === 'string' &&
    typeof obj.progress === 'number' &&
    typeof obj.formProgress === 'number' &&
    typeof obj.isComplete === 'boolean' &&
    typeof obj.lastUpdated === 'string'
  );
}

export function isMilestone(obj: any): obj is Milestone {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    ['communication', 'motor', 'social', 'concerns'].includes(obj.category) &&
    typeof obj.expectedAge === 'number' &&
    (obj.actualAge === undefined || typeof obj.actualAge === 'number') &&
    (obj.stackPosition === undefined || typeof obj.stackPosition === 'number') &&
    (obj.status === undefined || ['typical', 'monitor', 'delayed', 'pending'].includes(obj.status))
  );
}

export interface AssessmentEntry {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  status?: 'pending' | 'completed' | 'scheduled';
  result?: string;
}

export interface AssessmentLogData {
  type: 'assessmentLog';
  selectedAssessments: Assessment[];
  entries: {
    [key: string]: {
      id: string;
      name: string;
      date?: string;
      notes?: string;
      color: string;
      category: string;
      status?: 'pending' | 'completed' | 'scheduled';
      addedAt?: string;
      lastModified?: string;
    };
  };
  progress?: number;
  isComplete?: boolean;
  lastUpdated?: string;
}

export function isAssessmentEntry(data: any): data is AssessmentEntry {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    (data.date === undefined || typeof data.date === 'string') &&
    (data.notes === undefined || typeof data.notes === 'string') &&
    (data.status === undefined || ['pending', 'completed', 'scheduled'].includes(data.status)) &&
    (data.result === undefined || typeof data.result === 'string')
  );
}

export function isAssessmentLogData(data: any): data is AssessmentLogData {
  return (
    data &&
    data.type === 'assessmentLog' &&
    Array.isArray(data.selectedAssessments) &&
    data.selectedAssessments.every(isAssessmentEntry) &&
    typeof data.entries === 'object' &&
    Object.values(data.entries).every(isAssessmentEntry) &&
    typeof data.progress === 'number' &&
    typeof data.isComplete === 'boolean'
  );
}

export interface AssessmentData {
  sensoryProfile?: SensoryProfileData;
  socialCommunication?: SocialCommunicationData;
  behaviorInterests?: BehaviorInterestsData;
  milestones?: MilestoneTrackerData;
  assessmentLog?: AssessmentLogData;
  summary?: AssessmentSummaryData;
}

export interface AssessmentSummaryData extends AssessmentBase {
  type: 'summary';
  includeInReport?: boolean;
  isComplete?: boolean;
  lastUpdated?: string;
}

export interface GlobalState {
  chataId: string;
  formData: FormState | null;
  assessments: AssessmentData;
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

export interface GlobalFormState {
  formData: FormState;
  assessments: Required<AssessmentData>;
  clinician: ClinicianInfo;
  chataId: string;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
} 