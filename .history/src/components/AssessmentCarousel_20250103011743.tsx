import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, SkipForward } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfileBuilder } from './SocialCommunicationProfileBuilder';
import { BehaviorInterestsProfile } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { GlobalFormState } from '../types/index';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';

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
    component: SocialCommunicationProfileBuilder,
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

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ onProgressUpdate }) => {
  const { globalState, setGlobalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(() => globalState.currentStep || 0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [completionStates, setCompletionStates] = useState<Record<string, CompletionState>>({});

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
            typeof domain.value === 'number'
          ).length / domainCount * 60;
          
          // Calculate observation progress (max 40%)
          const observationProgress = domains.filter((domain: any) => 
            domain.observations?.length > 0
          ).length / domainCount * 40;
          
          // Take the maximum between the two to avoid double counting
          progress = Math.min(sliderProgress + observationProgress, 100);
          
          isComplete = progress >= 90;
        }
        break;

      case 'milestoneTracker':
        if (component.milestones && Array.isArray(component.milestones)) {
          const placedCount = component.milestones.filter((m: any) => 
            typeof m.actualAge === 'number'
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
              if (entry.date) entryProgress += 0.5; // 50% for date
              if (entry.notes?.trim().length > 0) entryProgress += 0.5; // 50% for notes
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
    setCurrentIndex((prev: number) => prev === tools.length - 1 ? 0 : prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev: number) => prev === 0 ? tools.length - 1 : prev - 1);
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleComponentUpdate = (data: any) => {
    const componentId = tools[currentIndex].id;
    
    if (componentId === 'milestones') {
      const updatedData = {
        type: 'milestoneTracker',
        milestones: data.milestones || []
      };
      updateAssessment(componentId, updatedData);
    } else {
      const updatedData = {
        ...data,
        type: componentId
      };
      updateAssessment(componentId, updatedData);
    }
  };

  useEffect(() => {
    const newStates: Record<string, CompletionState> = {};
    
    tools.forEach(tool => {
      const component = globalState.assessments[tool.id];
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
  }, [globalState.assessments]);

  useEffect(() => {
    if (!globalState.assessments) return;
    
    // First calculate raw progress for each component
    const componentProgresses = tools.map(tool => {
      const state = completionStates[tool.id];
      if (state?.isComplete) return 10; // Cap at exactly 10% if complete
      return Math.min((state?.progress || 0) / 10, 10); // Cap progress at 10%
    });

    // Sum up all progress and enforce hard cap at 100
    const totalProgress = Math.floor(Math.min(
      componentProgresses.reduce((acc, progress) => acc + progress, 0),
      100
    ));
    
    if (!isInitialized) {
      setIsInitialized(true);
      onProgressUpdate(totalProgress);
    } else {
      onProgressUpdate(totalProgress);
    }
  }, [completionStates, isInitialized]);

  useEffect(() => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      currentStep: currentIndex
    }));
  }, [currentIndex]);

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
          Mark Complete
        </button>
      </div>
    );
  };

  const renderCompletionStatus = () => {
    const state = completionStates[currentTool.id];
    if (!state?.progress && !state?.isComplete) return null;

    return (
      <div className={styles.completionStatus}>
        {state.isComplete ? (
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
        ) : (
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

  return (
    <div className={styles.container}>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{tools[currentIndex].title}</h2>
            <div className={styles.toolkitButton}>
              <HelpCircle size={20} />
              <div className={styles.toolkitTooltip}>{getTooltipContent(tools[currentIndex].title)}</div>
            </div>
            {renderCompletionStatus()}
          </div>

          <div className={styles.navigationSection}>
            {renderCompletionControls()}
            <button onClick={handlePrevious} className={styles.navButton}>
              <ChevronLeft size={20} />
            </button>
            <div className={styles.carouselIndicators}>
              {tools.map((tool, index) => (
                <button
                  key={tool.id}
                  className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''} ${
                    completionStates[tool.id]?.isComplete ? styles.complete : ''
                  }`}
                  onClick={() => handleIndicatorClick(index)}
                  title={tool.title}
                />
              ))}
            </div>
            <button onClick={handleNext} className={styles.navButton}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className={styles.carouselContent}>
          {(currentTool.id === 'sensoryProfile' || 
            currentTool.id === 'socialCommunication' || 
            currentTool.id === 'behaviorInterests') ? (
            <div className={styles.componentWithGraph}>
              <div className={styles.graphSection}>
                {currentTool.id === 'sensoryProfile' && (
                  <SensoryProfileGraph
                    data={globalState.assessments[currentTool.id]}
                  />
                )}
              </div>
              <div className={styles.sliderSection}>
                <div className={styles.sliderContainer}>
                  <CurrentComponent
                    data={globalState.assessments[tools[currentIndex].id]}
                    onChange={handleComponentUpdate}
                  />
                  {completionStates[currentTool.id]?.isComplete && (
                    <div className={styles.completionOverlay} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.componentContainer}>
              <CurrentComponent
                data={globalState.assessments[tools[currentIndex].id]}
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