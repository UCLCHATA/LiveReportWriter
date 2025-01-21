import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';
import { CarouselHeader } from './CarouselHeader';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  progress: number;
  formState?: any;
  onStateChange: (state: any) => void;
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
  id: string;
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
  progress,
  formState,
  onStateChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completionStates, setCompletionStates] = useState<Record<string, CompletionState>>({});
  const [assessmentState, setAssessmentState] = useState(formState || {});

  // Update local state when form state changes
  useEffect(() => {
    if (formState) {
      setAssessmentState(formState);
    }
  }, [formState]);

  const handleMarkComplete = (toolId: string) => {
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: true,
        autoDetected: false
      }
    }));
  };

  const handleMarkIncomplete = (toolId: string) => {
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: false,
        autoDetected: false
      }
    }));
  };

  const calculateComponentProgress = useCallback((component: any) => {
    if (!component) return { progress: 0, isComplete: false };
    let progress = 0;
    let isComplete = false;

    switch (component.type) {
      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          const domains = Object.values(component.domains);
          const domainCount = domains.length;
          
          // Calculate slider progress (max 60%)
          const sliderProgress = domains.filter((domain: any) => 
            typeof domain.value === 'number' && domain.value !== 0
          ).length / domainCount * 60;
          
          // Calculate observation progress (max 40%)
          const observationProgress = domains.filter((domain: any) => 
            domain.observations?.length > 0 && domain.observations.some((obs: string) => obs.trim().length > 0)
          ).length / domainCount * 40;
          
          progress = Math.min(sliderProgress + observationProgress, 100);
          isComplete = progress >= 90;
        }
        break;

      case 'milestoneTracker':
        if (component.milestones && Array.isArray(component.milestones)) {
          const placedCount = component.milestones.filter((m: any) => 
            typeof m.actualAge === 'number' && m.actualAge > 0
          ).length;
          progress = Math.min((placedCount / component.milestones.length) * 100, 100);
          isComplete = progress >= 90;
        }
        break;

      case 'assessmentLog':
        const selectedAssessments = component.selectedAssessments || [];
        const entries = component.entries || {};
        
        if (selectedAssessments.length > 0) {
          let entryProgress = 0;
          selectedAssessments.forEach((assessment: any) => {
            const entry = entries[assessment.id];
            if (entry) {
              if (entry.date) entryProgress += 0.5;
              if (entry.notes?.trim().length > 0) entryProgress += 0.5;
            }
          });
          
          progress = Math.min((entryProgress / selectedAssessments.length) * 100, 100);
          isComplete = progress >= 90;
        }
        break;
    }

    return { progress, isComplete };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tools.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? tools.length - 1 : prev - 1));
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleComponentUpdate = (data: any) => {
    const componentId = tools[currentIndex].id;
    const updatedState = {
      ...assessmentState,
      [componentId]: {
        ...data,
        type: componentId
      }
    };
    setAssessmentState(updatedState);
    onStateChange(updatedState);
  };

  // Update completion states when assessment state changes
  useEffect(() => {
    const newStates: Record<string, CompletionState> = {};
    
    tools.forEach(tool => {
      const component = assessmentState[tool.id];
      const { progress, isComplete } = calculateComponentProgress(component);
      
      newStates[tool.id] = {
        ...completionStates[tool.id],
        progress,
        isComplete: completionStates[tool.id]?.isComplete || isComplete,
        isSkipped: completionStates[tool.id]?.isSkipped || false,
        autoDetected: isComplete && !completionStates[tool.id]?.isComplete
      };
    });

    setCompletionStates(newStates);
  }, [assessmentState]);

  // Update overall progress
  useEffect(() => {
    const componentProgresses = tools.map(tool => {
      const state = completionStates[tool.id];
      return state ? state.progress : 0;
    });
    
    const totalProgress = componentProgresses.reduce((sum, p) => sum + p, 0) / tools.length;
    onProgressUpdate(totalProgress);
  }, [completionStates, onProgressUpdate]);

  const CurrentComponent = tools[currentIndex].component;
  const currentTool = tools[currentIndex];

  const renderCompletionControls = () => {
    const state = completionStates[currentTool.id];
    if (state?.isComplete) return null;

    return (
      <div className={styles.completionControls}>
        <button
          className={styles.completeButton}
          onClick={() => handleMarkComplete(currentTool.id)}
        >
          <CheckCircle2 size={16} />
          <span>Mark Complete</span>
        </button>
        {state?.progress > 0 && (
          <div className={styles.progressIndicator}>
            <div 
              className={styles.progressBar}
              style={{ width: `${state.progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderCompletionStatus = () => {
    const state = completionStates[currentTool.id];
    if (!state?.isComplete) return null;

    return (
      <div className={styles.completionStatus}>
        <div className={styles.statusBadge}>
          <CheckCircle2 size={14} />
          <span>Complete</span>
          <button 
            className={styles.undoButton}
            onClick={() => handleMarkIncomplete(currentTool.id)}
          >
            Undo
          </button>
        </div>
      </div>
    );
  };

  const renderComponentIcon = () => {
    const iconSrc = getComponentIcon(currentTool.id);
    if (!iconSrc) return null;
    
    return (
      <img 
        src={iconSrc} 
        alt="" 
        className={styles.componentIcon} 
      />
    );
  };

  return (
    <div className={styles.carousel}>
      <CarouselHeader
        tools={tools}
        currentIndex={currentIndex}
        completionStates={completionStates}
        onIndicatorClick={handleIndicatorClick}
      />
      
      <div className={styles.carouselContent}>
        <button onClick={handlePrevious} className={styles.navButton}>
          <ChevronLeft size={24} />
        </button>

        <div className={styles.componentContainer}>
          {React.createElement(tools[currentIndex].component, {
            data: assessmentState[tools[currentIndex].id] || {},
            onChange: handleComponentUpdate
          })}
        </div>

        <button onClick={handleNext} className={styles.navButton}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default AssessmentCarousel; 