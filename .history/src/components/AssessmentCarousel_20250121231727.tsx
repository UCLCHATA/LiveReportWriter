import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { AssessmentData, GlobalFormState } from '../types/formState';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
import { IconType } from 'react-icons';
import { 
  SensoryDomain,
  SocialCommunicationDomain,
  BehaviorDomain,
  AssessmentDomainBase 
} from '../types';
import { FiActivity, FiBarChart2, FiCalendar, FiClipboard, FiList, FiStar } from 'react-icons/fi';
import SensoryProfileComponent from './SensoryProfile';
import SocialCommunicationComponent from './SocialCommunication';
import BehaviorInterestsComponent from './BehaviorInterests';
import MilestoneTrackerComponent from './MilestoneTracker';
import AssessmentLogComponent from './AssessmentLogger';
import AssessmentSummaryComponent from './AssessmentSummary';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface ComponentProps {
  data: any;
  onChange: (data: any) => void;
}

interface CompletionState {
  progress: number;
  isComplete: boolean;
  autoDetected?: boolean;
}

type CompletionStates = {
  [K in keyof AssessmentData]: CompletionState;
};

interface Tool {
  id: keyof AssessmentData;
  title: string;
  component: React.ComponentType<any>;
  description: string;
  icon: IconType;
}

type GlobalState = Required<AssessmentData>;

const tools: Tool[] = [
  {
    id: 'sensoryProfile',
    title: 'Sensory Profile',
    component: SensoryProfileComponent,
    description: 'Assess sensory processing patterns',
    icon: FiActivity
  },
  {
    id: 'socialCommunication',
    title: 'Social Communication',
    component: SocialCommunicationComponent,
    description: 'Evaluate social interaction and communication skills',
    icon: FiList
  },
  {
    id: 'behaviorInterests',
    title: 'Behavior & Interests',
    component: BehaviorInterestsComponent,
    description: 'Document behavioral patterns and special interests',
    icon: FiBarChart2
  },
  {
    id: 'milestones',
    title: 'Milestone Tracker',
    component: MilestoneTrackerComponent,
    description: 'Track developmental milestones',
    icon: FiCalendar
  },
  {
    id: 'assessmentLog',
    title: 'Assessment Log',
    component: AssessmentLogComponent,
    description: 'Record previous assessments and reports',
    icon: FiClipboard
  },
  {
    id: 'summary',
    title: 'Assessment Summary',
    component: AssessmentSummaryComponent,
    description: 'Review and finalize assessment',
    icon: FiStar
  }
];

// Utility functions
const processDomainData = (data: any) => {
  if (!data || !data.domains) return null;
  return Object.entries(data.domains).map(([key, value]: [string, any]) => ({
    name: key,
    value: value.value || 0,
    observations: value.observations || []
  }));
};

const checkCompletion = (data: any): boolean => {
  if (!data || !data.domains) return false;
  const domains = Object.values(data.domains);
  return domains.every((domain: any) => 
    typeof domain.value === 'number' && 
    domain.value !== 0 && 
    domain.observations?.length > 0
  );
};

// Null check helper
const assertGlobalState = (state: GlobalState | null): state is GlobalState => {
  if (!state) throw new Error('Global state is null');
  return true;
};

// Use the null check helper before accessing globalState
const handleSomeAction = () => {
  if (assertGlobalState(globalState)) {
    // Now TypeScript knows globalState is not null
    const data = globalState[someId];
    // ... rest of the code
  }
};

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = React.memo(({
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

  // Direct assessment updates - moved before first use
  const handleUpdateAssessment = useCallback((id: keyof AssessmentData, updates: any) => {
    const now = Date.now();
    
    // Special handling for milestone selections - update UI immediately
    if (id === 'assessmentLog' && updates.selectedAssessments) {
      updateAssessment(id, {
        ...updates,
        type: id,
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    // Throttle other updates
    if (now - lastSaveRef.current < MIN_SAVE_INTERVAL) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        handleUpdateAssessment(id, updates);
      }, MIN_SAVE_INTERVAL - (now - lastSaveRef.current));
      return;
    }

    // Update the state with new assessment state
    updateAssessment(id, {
      ...updates,
      type: id === 'summary' ? 'summary' : id,
      lastUpdated: new Date().toISOString()
    });
    
    // Update last save time
    lastSaveRef.current = now;
  }, [updateAssessment]);

  // Track completion states for all tools
  const [completionStates, setCompletionStates] = useState<Record<keyof AssessmentData, CompletionState>>(() => {
    // Initialize from saved state
    const states = {} as Record<keyof AssessmentData, CompletionState>;
    tools.forEach(tool => {
      const component = globalState.assessments[tool.id];
      states[tool.id] = {
        isComplete: component?.isComplete || false,
        progress: 0
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
    if (!globalState) return;

    // First update the assessment state
    updateAssessment(toolId, { 
      ...globalState.assessments[toolId],
      isComplete: true,
      lastUpdated: new Date().toISOString()
    });
    
    // Then update the completion state
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: true,
        progress: 100 // Force progress to 100% when marked complete
      }
    }));

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [updateAssessment, globalState]);

  const handleMarkIncomplete = useCallback((toolId: keyof AssessmentData) => {
    if (!globalState) return;

    // Calculate actual progress before marking incomplete
    const currentProgress = calculateProgress(globalState.assessments[toolId]);
    
    // First update the assessment state
    updateAssessment(toolId, { 
      ...globalState.assessments[toolId],
      isComplete: false,
      lastUpdated: new Date().toISOString()
    });
    
    // Then update the completion state
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: false,
        progress: currentProgress // Restore actual progress
      }
    }));
  }, [updateAssessment, calculateProgress, globalState]);

  // Update progress when component changes
  useEffect(() => {
    const currentTool = tools[currentIndex];
    if (!currentTool || !globalState) return;

    const component = globalState.assessments[currentTool.id];
    const progress = calculateProgress(component);
    const isComplete = component?.isComplete || false;
    
    // Only update if progress or completion state has changed
    if (progress !== completionStates[currentTool.id]?.progress || 
        isComplete !== completionStates[currentTool.id]?.isComplete) {
      setCompletionStates(prev => ({
        ...prev,
        [currentTool.id]: {
          ...prev[currentTool.id],
          progress: isComplete ? 100 : progress, // If complete, force 100%
          isComplete,
          autoDetected: false // Never auto-detect completion
        }
      }));
    }
  }, [currentIndex, globalState, calculateProgress, completionStates]);

  // Separate effect for total progress calculation with reduced frequency
  useEffect(() => {
    const debouncedProgressUpdate = debounce(() => {
      // Calculate component progress (50% of total)
      const componentProgress = Math.floor(
        (Object.entries(completionStates) as [keyof CompletionStates, CompletionState][])
          .filter(([id]) => id !== 'summary') // Exclude summary component
          .reduce((acc, [, state]) => {
            // Each component (excluding summary) can contribute up to 10% (50% ÷ 5 components)
            const componentContribution = state.isComplete ? 10 : Math.min(Math.floor(state.progress / 10), 10);
            return acc + componentContribution;
          }, 0)
      );

      // Get form progress from the assessment form (other 50%)
      const formProgress = Math.min(50, initialProgress);

      // Combine both progress values
      const totalProgress = Math.min(100, componentProgress + formProgress);
      handleProgressUpdate(totalProgress);
    }, 500);

    debouncedProgressUpdate();
    return () => debouncedProgressUpdate.cancel();
  }, [completionStates, handleProgressUpdate, initialProgress]);

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

  // Memoize the domain data processing
  const processedDomainData = useMemo(() => {
    const currentTool = tools[currentIndex];
    if (!currentTool) return null;
    return processDomainData(globalState.assessments[currentTool.id]);
  }, [currentIndex, globalState.assessments]);

  // Debounce the completion state updates
  const debouncedUpdateCompletion = useCallback(
    debounce((newState: any) => {
      const currentTool = tools[currentIndex];
      if (!currentTool) return;
      
      setCompletionStates(prev => ({
        ...prev,
        [currentTool.id]: newState
      }));
    }, 300),
    [currentIndex]
  );

  // Optimize the onChange handler
  const handleDataChange = useCallback((newData: any) => {
    const currentTool = tools[currentIndex];
    if (!currentTool) return;
    
    updateAssessment(currentTool.id, {
      ...newData,
      type: currentTool.id
    });
    
    // Debounce completion check
    debouncedUpdateCompletion({
      isComplete: checkCompletion(newData),
      progress: calculateProgress(newData),
      autoDetected: true
    });
  }, [currentIndex, updateAssessment, debouncedUpdateCompletion, calculateProgress]);

  return (
    <div className={styles.container}>
      <div 
        className={styles.carouselHeader}
        data-component={currentTool?.id?.toLowerCase()}
      >
        <div className={styles.titleSection}>
          <img 
            src={currentTool?.icon} 
            alt={`${currentTool?.title} icon`}
            className={styles.componentIcon}
          />
          <h2 className={styles.title}>
            {currentTool?.title}
            {currentTool?.id !== 'summary' && (
              <button className={styles.toolkitButton}>
                <HelpCircle size={16} />
                <div className={styles.toolkitTooltip}>
                  {currentTool?.description}
                </div>
              </button>
            )}
          </h2>
        </div>

        <div className={styles.navigationSection}>
          {currentTool?.id === 'summary' ? (
            <button 
              className={`${styles.includeButton} ${includeInReport ? styles.included : ''}`}
              onClick={handleToggleInclude}
            >
              {includeInReport ? 'Included' : 'Include in Report'}
            </button>
          ) : (
            <div className={styles.completionControls}>
              {!completionStates[currentTool?.id]?.isComplete && (
                <>
                  <div className={styles.componentProgress}>
                    <div className={styles.progressIndicator}>
                      <div 
                        className={styles.progressBar} 
                        style={{ 
                          width: `${completionStates[currentTool?.id]?.progress || 0}%` 
                        }} 
                      />
                    </div>
                    <span>{Math.round(completionStates[currentTool?.id]?.progress || 0)}%</span>
                  </div>
                  <button
                    className={styles.completeButton}
                    onClick={() => handleMarkComplete(currentTool?.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark Complete</span>
                  </button>
                </>
              )}
              {completionStates[currentTool?.id]?.isComplete && (
                <div className={styles.completionStatus}>
                  <div className={styles.statusBadge}>
                    <CheckCircle2 size={14} />
                    <span>Complete</span>
                    <button 
                      className={styles.undoButton}
                      onClick={() => handleMarkIncomplete(currentTool?.id)}
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

      <div 
        className={styles.componentContainer}
        data-component={currentTool?.id?.toLowerCase()}
      >
        {(currentTool?.id === 'sensoryProfile' || 
          currentTool?.id === 'socialCommunication' || 
          currentTool?.id === 'behaviorInterests') ? (
          <div className={styles.componentWithGraph}>
            <div className={`${styles.graphSection} ${completionStates[currentTool?.id]?.isComplete ? styles.completed : ''}`}>
              {currentTool?.id === 'sensoryProfile' && globalState.assessments.sensoryProfile && (
                <SensoryProfileGraph
                  data={globalState.assessments.sensoryProfile}
                />
              )}
              {currentTool?.id === 'socialCommunication' && globalState.assessments.socialCommunication && (
                <SocialCommunicationGraph
                  data={globalState.assessments.socialCommunication}
                />
              )}
              {currentTool?.id === 'behaviorInterests' && globalState.assessments.behaviorInterests && (
                <BehaviorInterestsGraph
                  data={globalState.assessments.behaviorInterests}
                />
              )}
            </div>
            <div className={styles.sliderSection}>
              <div className={styles.sliderContainer}>
                <CurrentComponent
                  data={globalState.assessments[currentTool?.id] || {}}
                  onChange={(data: any) => handleUpdateAssessment(currentTool?.id, {
                    ...data,
                    type: currentTool?.id
                  })}
                />
                {completionStates[currentTool?.id]?.isComplete && (
                  <div className={styles.completionOverlay} />
                )}
              </div>
            </div>
          </div>
        ) : currentTool?.id === 'summary' ? (
          <div className={styles.componentContainer}>
            <CurrentComponent
              data={globalState.assessments}
              onChange={(data: any) => handleUpdateAssessment(currentTool?.id, {
                ...data,
                type: currentTool?.id
              })}
            />
          </div>
        ) : (
          <div className={`${styles.componentContainer} ${currentTool?.id === 'milestones' ? styles.milestoneTracker : ''}`}>
            <CurrentComponent
              data={globalState.assessments[currentTool?.id] || {}}
              onChange={(data: any) => handleUpdateAssessment(currentTool?.id, {
                ...data,
                type: currentTool?.id
              })}
            />
            {completionStates[currentTool?.id]?.isComplete && (
              <div className={styles.completionOverlay} />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default AssessmentCarousel; 