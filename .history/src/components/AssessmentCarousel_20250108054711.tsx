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
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(initialProgress);

  // Track completion status for each assessment
  const completionStatus = {
    sensoryProfile: globalState.assessments.sensoryProfile.isComplete,
    socialCommunication: globalState.assessments.socialCommunication.isComplete,
    behaviorInterests: globalState.assessments.behaviorInterests.isComplete
  };

  const handleComplete = (type: keyof typeof completionStatus) => {
    const assessment = globalState.assessments[type];
    const newIsComplete = !assessment.isComplete;
    
    console.log('🎯 Toggling completion:', {
      type,
      wasComplete: assessment.isComplete,
      nowComplete: newIsComplete
    });

    updateAssessment(type, {
      isComplete: newIsComplete,
      // If marking as complete and progress isn't 100, set it to 100
      ...(newIsComplete && assessment.progress < 100 ? { progress: 100 } : {})
    });
  };

  // Update navigation icons to show completion status
  const renderNavigationIcon = (index: number) => {
    const type = ['sensoryProfile', 'socialCommunication', 'behaviorInterests'][index];
    const isComplete = completionStatus[type as keyof typeof completionStatus];

    return (
      <div 
        className={`nav-icon ${activeIndex === index ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
        onClick={() => setActiveIndex(index)}
      >
        {/* Add completion indicator */}
        {isComplete && <div className="completion-indicator" />}
        {/* Existing icon content */}
      </div>
    );
  };

  // Add completion overlay to assessment panels
  const renderAssessmentPanel = (type: keyof typeof completionStatus, index: number) => {
    const isComplete = completionStatus[type];

    return (
      <div className={`assessment-panel ${isComplete ? 'complete' : ''}`}>
        {/* Existing assessment content */}
        
        {/* Completion overlay */}
        {isComplete && (
          <div className="completion-overlay">
          <span>Complete</span>
          </div>
        )}
        
        {/* Complete/Incomplete button */}
          <button 
          className={`completion-toggle ${isComplete ? 'complete' : ''}`}
          onClick={() => handleComplete(type)}
          >
          {isComplete ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
      </div>
    );
  };

  return (
    <div className="assessment-carousel">
      <div className="navigation">
        {[0, 1, 2].map(index => renderNavigationIcon(index))}
          </div>

      <div className="carousel-content">
        {renderAssessmentPanel(
          ['sensoryProfile', 'socialCommunication', 'behaviorInterests'][activeIndex] as keyof typeof completionStatus,
          activeIndex
        )}
      </div>
    </div>
  );
};

export default AssessmentCarousel; 