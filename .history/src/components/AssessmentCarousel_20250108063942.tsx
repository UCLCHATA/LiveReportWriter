import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { AssessmentData } from '../types';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress?: number;
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

type AssessmentToolId = keyof AssessmentData;

interface Tool {
  id: AssessmentToolId;
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

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ 
  onProgressUpdate,
  initialProgress = 0
}) => {
  const { globalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(() => 0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [completionStates, setCompletionStates] = useState<Record<AssessmentToolId, CompletionState>>({});

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
          
          // Take the maximum between the two to avoid double counting
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

  // Initialize with saved progress
  useEffect(() => {
    if (!isInitialized && initialProgress > 0) {
      setCompletionStates(prev => {
        const newStates = { ...prev };
        tools.forEach(tool => {
          if (!newStates[tool.id]) {
            newStates[tool.id] = {
              isComplete: false,
              isSkipped: false,
              progress: 0,
              autoDetected: false
            };
          }
        });
        return newStates;
      });
      setIsInitialized(true);
    }
  }, [isInitialized, initialProgress]);

  // Track current step in state
  useEffect(() => {
    const currentTool = tools[currentIndex];
    if (currentTool) {
      const assessment = globalState.assessments[currentTool.id];
      const { progress, isComplete } = calculateComponentProgress(assessment);
      
      // Update completion state
      setCompletionStates(prev => ({
        ...prev,
        [currentTool.id]: {
          ...prev[currentTool.id],
          isComplete,
          progress,
          autoDetected: true
        }
      }));

      // Update global progress
      onProgressUpdate(progress);
    }
  }, [currentIndex, globalState.assessments, calculateComponentProgress, onProgressUpdate]);

  const handleMarkComplete = (toolId: AssessmentToolId) => {
    const assessment = globalState.assessments[toolId];
    const { progress } = calculateComponentProgress(assessment);
    
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: true,
        progress,
        autoDetected: false
      }
    }));

    // Update assessment completion status
    updateAssessment(toolId, {
      isComplete: true,
      progress
    });
  };

  const handleMarkIncomplete = (toolId: AssessmentToolId) => {
    const assessment = globalState.assessments[toolId];
    const { progress } = calculateComponentProgress(assessment);
    
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: false,
        progress,
        autoDetected: false
      }
    }));

    // Update assessment completion status
    updateAssessment(toolId, {
      isComplete: false,
      progress
    });
  };

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
        milestones: data.milestones || [],
        history: data.history || '',
        lastUpdated: new Date().toISOString()
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
    
    const componentProgresses = tools.map(tool => {
      const state = completionStates[tool.id];
      if (state?.isComplete) return 10;
      // Only count progress if it's above a minimal threshold (10%)
      const progress = state?.progress || 0;
      return progress > 10 ? Math.min(progress / 10, 10) : 0;
    });

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
    <div className={styles.container}>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselHeader}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              {renderComponentIcon()}
              {currentTool.title}
              <button className={styles.toolkitButton}>
                <HelpCircle size={16} />
                <div className={styles.toolkitTooltip}>
                  {getTooltipContent(currentTool.title)}
                </div>
              </button>
            </h2>
          </div>

          <div className={styles.navigationSection}>
            {renderCompletionControls()}
            {renderCompletionStatus()}
            
            <button onClick={handlePrevious} className={styles.navButton}>
              <ChevronLeft size={20} />
            </button>

            <div className={styles.carouselIndicators}>
              {tools.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentIndex ? styles.active : ''} ${
                    completionStates[tools[index].id]?.isComplete ? styles.complete : ''
                  }`}
                  onClick={() => handleIndicatorClick(index)}
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
              <div className={`${styles.graphSection} ${completionStates[currentTool.id]?.isComplete ? styles.completed : ''}`}>
                {currentTool.id === 'sensoryProfile' && (
                  <SensoryProfileGraph
                    data={globalState.assessments[currentTool.id]}
                  />
                )}
                {currentTool.id === 'socialCommunication' && (
                  <SocialCommunicationGraph
                    data={globalState.assessments[currentTool.id]}
                  />
                )}
                {currentTool.id === 'behaviorInterests' && (
                  <BehaviorInterestsGraph
                    data={globalState.assessments[currentTool.id]}
                  />
                )}
              </div>
              <div className={styles.sliderSection}>
                <div className={styles.sliderContainer}>
                  <CurrentComponent
                    data={globalState.assessments[currentTool.id]}
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
                data={globalState.assessments[currentTool.id]}
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