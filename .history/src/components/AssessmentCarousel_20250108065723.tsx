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
  const [isComplete, setIsComplete] = useState(() => globalState.assessments.sensoryProfile.isComplete);

  // Handle completion status changes
  const handleComplete = useCallback((complete: boolean) => {
    setIsComplete(complete);
    updateAssessment('sensoryProfile', { isComplete: complete });
  }, [updateAssessment]);

  // Update progress when sliders or observations change
  const handleDomainUpdate = useCallback((domain: string, value: number, observations: string[]) => {
    updateAssessment('sensoryProfile', {
      domains: {
        ...globalState.assessments.sensoryProfile.domains,
        [domain]: { value, observations }
      }
    });

    // Calculate progress based on filled domains
    const domains = globalState.assessments.sensoryProfile.domains;
    const filledDomains = Object.values(domains).filter(d => d.value > 0 || d.observations.length > 0).length;
    const progress = Math.round((filledDomains / Object.keys(domains).length) * 100);
    
    onProgressUpdate(progress);
  }, [globalState.assessments.sensoryProfile.domains, onProgressUpdate, updateAssessment]);

  return (
    <div className="assessment-carousel">
      {/* Render your carousel content */}
      {/* Use isComplete state to show/hide completion overlay */}
      {isComplete && <div className="completion-overlay" />}
      
      {/* Add complete button */}
                <button
        className={`complete-button ${isComplete ? 'complete' : ''}`}
        onClick={() => handleComplete(!isComplete)}
      >
        {isComplete ? 'Completed' : 'Mark Complete'}
            </button>
    </div>
  );
};

export default AssessmentCarousel; 