export type DevelopmentalDomain = 
  | 'Social Communication'
  | 'Motor Skills'
  | 'Language & Speech'
  | 'Play & Social Interaction'
  | 'Adaptive Skills'
  | 'Sensory Processing';

export type InformationSource = 'parent' | 'clinician' | 'teacher' | 'records';
export type MilestoneStatus = 'achieved' | 'partial' | 'not_achieved';

export interface Milestone {
  id: string;
  domain: DevelopmentalDomain;
  description: string;
  expectedAgeRange: {
    min: number; // age in months
    max: number; // age in months
  };
  actualAge?: number; // age in months
  notes?: string;
  source: InformationSource;
  status: MilestoneStatus;
  evidence?: string;
}

export interface TimelineItem {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type: 'range' | 'point';
  className?: string;
  group?: string;
  title?: string;
  milestone: Milestone;
}

export interface ClinicianInfo {
  name: string;
  email: string;
}

export interface FormProps {
  clinicianInfo: ClinicianInfo | null;
  isEnabled: boolean;
  onClear: () => void;
}

export interface TextBoxProps {
  title: string;
  icon: string;
  defaultText: string;
  value: string;
  onChange: (value: string) => void;
  isEnabled: boolean;
}

export interface ReferralOption {
  label: string;
  value: string;
} 