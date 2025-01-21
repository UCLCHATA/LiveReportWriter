import { DevelopmentalDomain, Milestone } from '../types';

export interface MilestoneReport {
  overallProgress: {
    achievedCount: number;
    partialCount: number;
    notAchievedCount: number;
    totalCount: number;
  };
  domainAnalysis: Record<DevelopmentalDomain, {
    milestones: Milestone[];
    summary: string;
    concerns: string[];
    progressPercentage: number;
  }>;
  clinicalImplications: string[];
  recommendations: string[];
  assessmentDate: string;
  lastUpdated: string;
}

export interface MilestoneTrackerState {
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
  selectedDomain: DevelopmentalDomain | 'all';
  isLoading: boolean;
  error: string | null;
}

export interface MilestoneAnalytics {
  byDomain: Record<DevelopmentalDomain, number>;
  byStatus: Record<Milestone['status'], number>;
  ageDistribution: {
    early: number;
    onTime: number;
    delayed: number;
  };
} 