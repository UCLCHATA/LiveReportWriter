import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { AssessmentSummary } from './AssessmentSummary';
import { useFormState } from '../hooks/useFormState';
import sensoryIcon from '../assets/sensory.png';
import socialIcon from '../assets/Social.png';
import behaviorIcon from '../assets/behavior-icon.png';
import developmentIcon from '../assets/development-icon.png';
import assessmentIcon from '../assets/assessment-icon.png';
import summaryIcon from '../assets/summary-icon.png';
import type { 
  FormState, 
  AssessmentData, 
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  AssessmentDomainBase
} from '../types';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

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
  id: keyof AssessmentData;
  title: string;
  component: React.ComponentType<ComponentProps>;
  description: string;
  icon: string;
}

const tools: Tool[] = [
  {
    id: 'sensoryProfile',
    title: 'Sensory Profile',
    component: SensoryProfileBuilder,
    description: 'Evaluate sensory processing patterns',
    icon: sensoryIcon
  },
  {
    id: 'socialCommunication',
    title: 'Social Communication',
    component: SocialCommunicationProfile,
    description: 'Assess social interaction and communication skills',
    icon: socialIcon
  },
  {
    id: 'behaviorInterests',
    title: 'Behavior & Interests',
    component: BehaviorInterestsProfile,
    description: 'Document behavioral patterns and interests',
    icon: behaviorIcon
  },
  {
    id: 'milestones',
    title: 'Milestone Tracker',
    component: MilestoneTracker,
    description: 'Track developmental milestones',
    icon: developmentIcon
  },
  {
    id: 'assessmentLog',
    title: 'Assessment Log',
    component: AssessmentLogger,
    description: 'Select utilized assessments, their scores and key observations/insights',
    icon: assessmentIcon
  },
  {
    id: 'summary',
    title: 'Assessment Summary',
    component: AssessmentSummary,
    description: 'View combined assessment profile and developmental progress',
    icon: summaryIcon
  }
];

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({
  onProgressUpdate,
  initialProgress
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { globalState, updateAssessment } = useFormState();
  const lastSaveRef = useRef<number>(0);
  const MIN_SAVE_INTERVAL = 2000;
  const [includeInReport, setIncludeInReport] = useState(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track completion states for all tools
  const [completionStates, setCompletionStates] = useState<Record<keyof AssessmentData, CompletionState>>(() => {
    // Initialize from saved state
    const states = {} as Record<keyof AssessmentData, CompletionState>;
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

  // Batch progress updates
  const handleProgressUpdate = useCallback((progress: number) => {
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    progressUpdateTimeoutRef.current = setTimeout(() => {
      if (progress !== initialProgress) {
        onProgressUpdate(progress);
        
        // Update all assessments in a single batch
        const updates = tools.reduce((acc, tool) => {
          acc[tool.id] = {
            ...globalState.assessments[tool.id],
            progress,
            lastUpdated: new Date().toISOString()
          };
          return acc;
        }, {} as Record<keyof AssessmentData, any>);

        // Single update call for all assessments
        Object.entries(updates).forEach(([type, data]) => {
          updateAssessment(type as keyof AssessmentData, data);
        });
      }
    }, 500); // Delay progress updates
  }, [initialProgress, onProgressUpdate, globalState.assessments, updateAssessment]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Define calculateProgress before using it
  const calculateProgress = useCallback((component: any) => {
    if (!component) return 0;
    
    switch (component.type) {
      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          const domains = Object.values(component.domains) as AssessmentDomainBase[];
          const domainCount = domains.length;

          const sliderProgress = domains.filter(domain => 
            typeof domain.value === 'number' && domain.value !== 0
          ).length / domainCount * 60;
          
          const observationProgress = domains.filter(domain => 
            domain.observations?.length > 0 && domain.observations.some((obs: string) => obs.trim().length > 0)
          ).length / domainCount * 40;
          
          return Math.min(sliderProgress + observationProgress, 100);
        }
        return 0;

      case 'milestones':
        if (component.milestones && Array.isArray(component.milestones)) {
          const placedCount = component.milestones.filter((m: any) => 
            typeof m.actualAge === 'number' && m.actualAge > 0
          ).length;
          return Math.min((placedCount / component.milestones.length) * 100, 100);
        }
        return 0;

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
          
          return Math.min((entryProgress / selectedAssessments.length) * 100, 100);
        }
        return 0;

      case 'summary':
        // Summary is complete when all other components are complete
        const otherComponents = ['sensoryProfile', 'socialCommunication', 'behaviorInterests', 'milestones', 'assessmentLog'];
        const completedCount = otherComponents.filter(id => 
          completionStates[id as keyof AssessmentData]?.isComplete
        ).length;
        return Math.min((completedCount / otherComponents.length) * 100, 100);

      default:
        return 0;
    }
  }, [completionStates]);

  const shouldSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    return timeSinceLastSave >= MIN_SAVE_INTERVAL;
  }, [MIN_SAVE_INTERVAL]);

  const handleMarkComplete = useCallback((toolId: keyof AssessmentData) => {
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
  }, [updateAssessment]);

  const handleMarkIncomplete = useCallback((toolId: keyof AssessmentData) => {
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
  }, [updateAssessment]);

  // Update progress when component changes
  useEffect(() => {
    const currentTool = tools[currentIndex];
    const component = globalState.assessments[currentTool.id];
    const progress = calculateProgress(component);
    
    // Only update if progress has changed
    if (progress !== completionStates[currentTool.id]?.progress) {
      setCompletionStates(prev => ({
        ...prev,
        [currentTool.id]: {
          ...prev[currentTool.id],
          progress,
          autoDetected: progress >= 100 && !prev[currentTool.id].isComplete
        }
      }));
    }
  }, [currentIndex, globalState.assessments, tools]);

  // Separate effect for total progress calculation with reduced frequency
  useEffect(() => {
    const totalProgress = Math.floor(
      Object.values(completionStates).reduce(
        (acc, state) => {
          const componentContribution = state.isComplete ? 10 : Math.min(Math.floor(state.progress / 10), 10);
          return acc + componentContribution;
        },
        0
      )
    );

    handleProgressUpdate(totalProgress);
  }, [completionStates, handleProgressUpdate]);

  const handleNext = () => {
    setCurrentIndex(prev => prev === tools.length - 1 ? 0 : prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? tools.length - 1 : prev - 1);
  };

  const CurrentComponent = tools[currentIndex].component;
  const currentTool = tools[currentIndex];

  const handleToggleInclude = useCallback(async () => {
    setIncludeInReport(prev => !prev);
    
    // If including in report, capture and preview the chart
    if (!includeInReport) {
      try {
        const chartElement = document.querySelector('.combined-radar-chart') as HTMLElement;
        if (chartElement) {
          const canvas = await html2canvas(chartElement);
          const chartImage = canvas.toDataURL('image/png');
          
          // Open image in new tab
          const newTab = window.open();
          if (newTab) {
            newTab.document.write(`<img src="${chartImage}" alt="Combined Radar Chart" />`);
          }
        }
      } catch (error) {
        console.error('Error capturing chart image:', error);
      }
    }

    // Update the assessment state to include the inclusion status
    updateAssessment('summary', {
      includeInReport: !includeInReport,
      type: 'summary',
      lastUpdated: new Date().toISOString()
    });
  }, [includeInReport, updateAssessment]);

  // Update completion states whenever assessments change, with optimizations
  useEffect(() => {
    const updateCompletionStates = () => {
      setCompletionStates(prev => {
        const newStates = { ...prev };
        let changed = false;

        tools.forEach(tool => {
          const component = globalState.assessments[tool.id];
          const progress = calculateProgress(component);
          const isComplete = tool.id === 'summary'
            ? progress === 100
            : component?.isComplete || false;

          if (progress !== prev[tool.id]?.progress || isComplete !== prev[tool.id]?.isComplete) {
            changed = true;
            newStates[tool.id] = {
              ...prev[tool.id],
              isComplete,
              progress,
              autoDetected: tool.id === 'summary' ? true : prev[tool.id]?.autoDetected || false
            };
          }
        });

        return changed ? newStates : prev;
      });
    };

    // Debounce the update to prevent rapid re-renders
    const timeoutId = setTimeout(updateCompletionStates, 100);
    return () => clearTimeout(timeoutId);
  }, [globalState.assessments, tools, calculateProgress]);

  return (
    <div className={styles.container}>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselHeader}>
          <div className={styles.titleSection}>
            <img 
              src={currentTool.icon} 
              alt={`${currentTool.title} icon`}
              className={styles.componentIcon}
            />
            <h2 className={styles.title}>
              {currentTool.title}
              {currentTool.id !== 'summary' && (
                <button className={styles.toolkitButton}>
                  <HelpCircle size={16} />
                  <div className={styles.toolkitTooltip}>
                    {currentTool.description}
                  </div>
                </button>
              )}
            </h2>
          </div>

          <div className={styles.navigationSection}>
            {currentTool.id === 'summary' ? (
              <button 
                className={`${styles.includeButton} ${includeInReport ? styles.included : ''}`}
                onClick={handleToggleInclude}
              >
                {includeInReport ? 'Included' : 'Include in Report'}
              </button>
            ) : (
              <div className={styles.completionControls}>
                {!completionStates[currentTool.id]?.isComplete && (
                  <>
                    <div className={styles.componentProgress}>
                      <div className={styles.progressIndicator}>
                        <div 
                          className={styles.progressBar} 
                          style={{ 
                            width: `${completionStates[currentTool.id]?.progress || 0}%` 
                          }} 
                        />
                      </div>
                      <span>{Math.round(completionStates[currentTool.id]?.progress || 0)}%</span>
                    </div>
                    <button
                      className={styles.completeButton}
                      onClick={() => handleMarkComplete(currentTool.id)}
                    >
                      <CheckCircle2 size={16} />
                      <span>Mark Complete</span>
                    </button>
                  </>
                )}
                {completionStates[currentTool.id]?.isComplete && (
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
                )}
              </div>
            )}

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
                  onClick={() => setCurrentIndex(index)}
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
                {currentTool.id === 'sensoryProfile' && globalState.assessments.sensoryProfile && (
                  <SensoryProfileGraph
                    data={globalState.assessments.sensoryProfile}
                  />
                )}
                {currentTool.id === 'socialCommunication' && globalState.assessments.socialCommunication && (
                  <SocialCommunicationGraph
                    data={globalState.assessments.socialCommunication}
                  />
                )}
                {currentTool.id === 'behaviorInterests' && globalState.assessments.behaviorInterests && (
                  <BehaviorInterestsGraph
                    data={globalState.assessments.behaviorInterests}
                  />
                )}
              </div>
              <div className={styles.sliderSection}>
                <div className={styles.sliderContainer}>
                  <CurrentComponent
                    data={globalState.assessments[currentTool.id] || {}}
                    onChange={(data: any) => handleUpdateAssessment(currentTool.id, {
                      ...data,
                      type: currentTool.id
                    })}
                  />
                  {completionStates[currentTool.id]?.isComplete && (
                    <div className={styles.completionOverlay} />
                  )}
                </div>
              </div>
            </div>
          ) : currentTool.id === 'summary' ? (
            <div className={styles.componentContainer}>
              <CurrentComponent
                data={globalState.assessments}
                onChange={(data: any) => handleUpdateAssessment(currentTool.id, {
                  ...data,
                  type: currentTool.id
                })}
              />
            </div>
          ) : (
            <div className={`${styles.componentContainer} ${currentTool.id === 'milestones' ? styles.milestoneTracker : ''}`}>
              <CurrentComponent
                data={globalState.assessments[currentTool.id] || {}}
                onChange={(data: any) => handleUpdateAssessment(currentTool.id, {
                  ...data,
                  type: currentTool.id
                })}
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