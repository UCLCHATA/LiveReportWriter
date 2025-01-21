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

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ onProgressUpdate }) => {
  const { globalState, updateAssessments } = useFormState();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Ensure assessments are initialized
  useEffect(() => {
    if (!globalState.assessments) {
      updateAssessment('sensoryProfile', null);
      updateAssessment('socialCommunication', null);
      updateAssessment('behaviorInterests', null);
      updateAssessment('milestones', null);
      updateAssessment('assessmentLog', null);
    }
  }, [globalState.assessments, updateAssessment]);

  const getAssessmentData = (toolId: string) => {
    return globalState.assessments?.[toolId] || null;
  };

  // Update the component render to use getAssessmentData
  return (
    <div className={styles.container}>
      <div className={styles.carouselContainer}>
        {/* ... other content ... */}
        <div className={styles.carouselContent}>
          {(currentTool.id === 'sensoryProfile' || 
            currentTool.id === 'socialCommunication' || 
            currentTool.id === 'behaviorInterests') ? (
            <div className={styles.componentWithGraph}>
              <div className={`${styles.graphSection} ${completionStates[currentTool.id]?.isComplete ? styles.completed : ''}`}>
                {currentTool.id === 'sensoryProfile' && (
                  <SensoryProfileGraph
                    data={getAssessmentData(currentTool.id)}
                  />
                )}
                {currentTool.id === 'socialCommunication' && (
                  <SocialCommunicationGraph
                    data={getAssessmentData(currentTool.id)}
                  />
                )}
                {currentTool.id === 'behaviorInterests' && (
                  <BehaviorInterestsGraph
                    data={getAssessmentData(currentTool.id)}
                  />
                )}
              </div>
              <div className={styles.sliderSection}>
                <div className={styles.sliderContainer}>
                  <CurrentComponent
                    data={getAssessmentData(currentTool.id)}
                    onChange={handleComponentUpdate}
                  />
                  {completionStates[currentTool.id]?.isComplete && (
                    <div className={styles.completionOverlay} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.componentContainer} ${currentTool.id === 'milestones' ? styles.milestoneTracker : ''}`}>
              <CurrentComponent
                data={getAssessmentData(currentTool.id)}
                onChange={handleComponentUpdate}
              />
              {completionStates[currentTool.id]?.isComplete && (
                <div className={styles.completionOverlay} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCarousel; 