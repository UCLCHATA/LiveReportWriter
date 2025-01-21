import { useState, useEffect, useCallback } from 'react';
import { FormState, ClinicianInfo, AssessmentData, Milestone } from '../types';

export const useFormState = () => {
  const [globalState, setGlobalState] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem('milestone-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return {
      clinicianInfo: null,
      assessments: {
        type: 'initial',
        progress: 0
      },
      milestones: {
        type: 'milestoneTracker',
        milestones: [],
        history: '',
        progress: 0
      }
    };
  });

  const updateMilestones = useCallback((milestones: Milestone[]) => {
    setGlobalState(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        milestones
      }
    }));
  }, []);

  const updateHistory = useCallback((history: string) => {
    setGlobalState(prev => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        history
      }
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem('milestone-state', JSON.stringify(globalState));
  }, [globalState]);

  return {
    globalState,
    updateMilestones,
    updateHistory
  };
};
