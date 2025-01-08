export interface FormState {
  clinicianInfo: ClinicianInfo | null;
  assessments: AssessmentData;
  milestones: {
    type: 'milestoneTracker';
    milestones: Milestone[];
    history: string;
    progress: number;
  };
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