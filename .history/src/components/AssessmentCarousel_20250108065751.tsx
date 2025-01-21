import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { GlobalFormState } from '../types/index';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';
import { CarouselHeader } from './CarouselHeader';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface ComponentProps {
  data: any;
  onChange: (data: any) => void;
}

interface CompletionState {
  isComplete: boolean;
  isSkipped: boolean;
  progress: number;
  autoDetected: boolean;
}

interface Tool {
  id: keyof GlobalFormState['assessments'];
  title: string;
  component: React.ComponentType<ComponentProps>;
  description: string;
}

const tools: Tool[] = [
  {
    id: 'sensoryProfile',
    title: 'Sensory Profile',
    component: SensoryProfileBuilder,
    description: 'Evaluate sensory processing patterns'
  },
  {
    id: 'socialCommunication',
    title: 'Social Communication',
    component: SocialCommunicationProfile,
    description: 'Assess social interaction and communication skills'
  },
  {
    id: 'behaviorInterests',
    title: 'Behavior & Interests',
    component: BehaviorInterestsProfile,
    description: 'Document behavioral patterns and interests'
  },
  {
    id: 'milestones',
    title: 'Milestone Tracker',
    component: MilestoneTracker,
    description: 'Track developmental milestones'
  },
  {
    id: 'assessmentLog',
    title: 'Assessment Log',
    component: AssessmentLogger,
    description: 'Record and monitor assessment progress'
  }
];

const getTooltipContent = (title: string): string => {
  switch (title) {
    case 'Sensory Profile':
      return '• Visual, auditory, tactile processing\n• Vestibular and proprioceptive responses\n• Oral sensitivities\n• Sensory seeking/avoiding behaviors';
    case 'Social Communication':
      return '• Joint attention and engagement\n• Verbal/non-verbal communication\n• Social understanding and reciprocity\n• Play skills and peer interactions';
    case 'Behavior & Interests':
      return '• Repetitive behaviors and routines\n• Special interests and fixations\n• Flexibility and transitions\n• Self-regulation abilities';
    case 'Milestone Tracker':
      return '• Motor development\n• Language milestones\n• Social-emotional growth\n• Cognitive development';
    case 'Assessment Log':
      return '• Session observations\n• Progress tracking\n• Assessment notes\n• Development monitoring';
    default:
      return '';
  }
};

const getComponentIcon = (componentId: string) => {
  switch (componentId) {
    case 'sensoryProfile':
      return '/assets/sensory.png';
    case 'socialCommunication':
      return '/assets/Social.png';
    case 'behaviorInterests':
      return '/assets/behavior icon.png';
    case 'milestones':
      return '/assets/development icon.png';
    case 'assessmentLog':
      return '/assets/assessment icon.png';
    default:
      return null;
  }
};

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ 
  onProgressUpdate,
  initialProgress
}) => {
  const { globalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completionStates, setCompletionStates] = useState<Record<string, CompletionState>>(() => {
    const states: Record<string, CompletionState> = {};
    tools.forEach(tool => {
      const component = globalState.assessments[tool.id];
      states[tool.id] = {
        isComplete: component?.isComplete || false,
        isSkipped: false,
        progress: 0,
        autoDetected: false
      };
    });
    return states;
  });

  const handleMarkComplete = (toolId: string) => {
    setCompletionStates(prev => {
      const newState = {
        ...prev,
        [toolId]: {
          ...prev[toolId],
          isComplete: true,
          autoDetected: false
        }
      };
      
      updateAssessment(toolId, { 
        isComplete: true,
        lastUpdated: new Date().toISOString()
      });
      
      return newState;
    });
  };

  const handleMarkIncomplete = (toolId: string) => {
    setCompletionStates(prev => {
      const newState = {
        ...prev,
        [toolId]: {
          ...prev[toolId],
          isComplete: false,
          autoDetected: false
        }
      };
      
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