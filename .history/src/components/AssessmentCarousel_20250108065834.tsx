import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { FormState, AssessmentData } from '../types';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface CompletionState {
  isComplete: boolean;
  isSkipped: boolean;
  progress: number;
  autoDetected: boolean;
}

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({
  onProgressUpdate,
  initialProgress
}) => {
  const { globalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track completion states for all tools
  const [completionStates, setCompletionStates] = useState<Record<keyof AssessmentData, CompletionState>>(() => {
    // Initialize from saved state
    const states = {} as Record<keyof AssessmentData, CompletionState>;
    (Object.keys(globalState.assessments) as Array<keyof AssessmentData>).forEach(toolId => {
      const component = globalState.assessments[toolId];
      states[toolId] = {
        isComplete: component?.isComplete || false,
        isSkipped: false,
        progress: 0,
        autoDetected: false
      };
    });
    return states;
  });

  const handleMarkComplete = (toolId: keyof AssessmentData) => {
    setCompletionStates(prev => {
      const newState = {
        ...prev,
        [toolId]: {
          ...prev[toolId],
          isComplete: true,
          autoDetected: false
        }
      };
      
      // Update the assessment state
      updateAssessment(toolId, { 
        isComplete: true,
        lastUpdated: new Date().toISOString()
      });
      
      return newState;
    });
  };

  const handleMarkIncomplete = (toolId: keyof AssessmentData) => {
    setCompletionStates(prev => {
      const newState = {
        ...prev,
        [toolId]: {
          ...prev[toolId],
          isComplete: false,
          autoDetected: false
        }
      };
      
      // Update the assessment state
      updateAssessment(toolId, { 
        isComplete: false,
        lastUpdated: new Date().toISOString()
      });
      
      return newState;
    });
  };

  const calculateComponentProgress = useCallback((component: any) => {
    if (!component) return { progress: 0, isComplete: false };
    
    if (typeof component.isComplete === 'boolean') {
      return { 
        progress: component.isComplete ? 100 : calculateProgress(component),
        isComplete: component.isComplete
      };
    }
    
    const progress = calculateProgress(component);
    return { 
      progress,
      isComplete: progress >= 90
    };
  }, []);

  const calculateProgress = (component: any) => {
    if (!component) return 0;
    
    switch (component.type) {
      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          const domains = Object.values(component.domains);
          const domainCount = domains.length;

          const sliderProgress = domains.filter((domain: any) => 
            typeof domain.value === 'number' && domain.value !== 0
          ).length / domainCount * 60;
          
          const observationProgress = domains.filter((domain: any) => 
            domain.observations?.length > 0 && domain.observations.some((obs: string) => obs.trim().length > 0)
          ).length / domainCount * 40;
          
          return Math.min(sliderProgress + observationProgress, 100);
        }
        return 0;

      // ... rest of the cases stay the same ...
    }
    return 0;
  };

  return (
    <div className="assessment-carousel">
      {/* Render your carousel content */}
      {/* Use isComplete state to show/hide completion overlay */}
      {completionStates['sensoryProfile']?.isComplete && <div className="completion-overlay" />}
      
      {/* Add complete button */}
      <button
        className={`complete-button ${completionStates['sensoryProfile']?.isComplete ? 'complete' : ''}`}
        onClick={() => handleMarkComplete('sensoryProfile')}
      >
        {completionStates['sensoryProfile']?.isComplete ? 'Completed' : 'Mark Complete'}
      </button>
    </div>
  );
};

export default AssessmentCarousel; 