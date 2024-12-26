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