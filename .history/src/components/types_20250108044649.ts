export type DevelopmentalDomain = 
  | 'Social Communication'
  | 'Motor Skills'
  | 'Language & Speech'
  | 'Play & Social Interaction'
  | 'Adaptive Skills'
  | 'Sensory Processing';

export type CategoryType = 'communication' | 'motor' | 'social' | 'concerns';

export type MilestoneStatus = 'achieved' | 'partial' | 'not_achieved' | 'typical' | 'monitor' | 'delayed' | 'pending';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  category: CategoryType;
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: MilestoneStatus;
  notes?: string;
  source?: 'parent' | 'clinician' | 'teacher' | 'records';
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