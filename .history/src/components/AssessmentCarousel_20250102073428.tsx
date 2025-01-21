import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, SkipForward } from 'lucide-react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
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

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ onProgressUpdate }) => {
  const { globalState, setGlobalState } = useFormState();
  const [activeIndex, setActiveIndex] = useState(0);
  const [completionStates, setCompletionStates] = useState<Record<string, CompletionState>>({});

  const handleMarkComplete = (toolId: string, skip: boolean = false) => {
    setCompletionStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        isComplete: true,
        isSkipped: skip,
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
        isSkipped: false,
        autoDetected: false
      }
    }));
  };

  const calculateComponentProgress = useCallback((component: any) => {
    if (!component) return { progress: 0, isComplete: false };
    let progress = 0;
    let isComplete = false;

    switch (component.type) {
      case 'milestoneTracker':
        if (component.milestones && Array.isArray(component.milestones)) {
          const placedCount = component.milestones.filter((m: any) => 
            typeof m.actualAge === 'number'
          ).length;
          progress = Math.min((placedCount / component.milestones.length) * 100, 100);
          isComplete = progress === 100;
        }
        break;

      case 'assessmentLog':
        const selectedAssessments = component.selectedAssessments || [];
        const entries = component.entries || {};
        
        let entryProgress = 0;
        selectedAssessments.forEach((assessment: any) => {
          const entry = entries[assessment.id];
          if (entry) {
            if (entry.date) entryProgress += 1;
            if (entry.notes?.trim().length > 0) entryProgress += 1;
          }
        });

        if (selectedAssessments.length > 0) {
          progress = Math.min((entryProgress / (selectedAssessments.length * 2)) * 100, 100);
          isComplete = progress >= 80; // Consider complete if 80% filled
        }
        break;

      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          const domains = Object.values(component.domains);
          const domainCount = domains.length;
          
          const completedSliders = domains.filter((domain: any) => 
            typeof domain.value === 'number' && domain.value !== 3
          ).length;
          
          const domainsWithObservations = domains.filter((domain: any) => 
            domain.observations?.length > 0
          ).length;
          
          progress = Math.min(
            ((completedSliders / domainCount) * 60) + 
            ((domainsWithObservations / domainCount) * 40), 
            100
          );
          
          isComplete = progress >= 90; // Consider complete if 90% filled
        }
        break;
    }

    return { progress, isComplete };
  }, []);

  useEffect(() => {
    // Update completion states based on component progress
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

  const renderCompletionOverlay = (toolId: string) => {
    const state = completionStates[toolId];
    if (!state?.isComplete && !state?.isSkipped) return null;

    return (
      <div 
        className={`${styles.completionOverlay} ${state.isSkipped ? styles.skipped : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.completionStatus}>
          {state.isSkipped ? (
            <>
              <SkipForward className={styles.statusIcon} />
              <span>Skipped</span>
            </>
          ) : (
            <>
              <CheckCircle2 className={styles.statusIcon} />
              <span>Complete</span>
            </>
          )}
          <button 
            className={styles.undoButton}
            onClick={() => handleMarkIncomplete(toolId)}
          >
            Undo
          </button>
        </div>
      </div>
    );
  };

  const updateGlobalState = (updates: Partial<GlobalFormState>) => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {tools.map((tool, index) => (
          <div key={tool.id} className={styles.componentWrapper}>
            <div className={styles.componentHeader}>
              <h2>{tool.title}</h2>
              <div className={styles.headerControls}>
                {!completionStates[tool.id]?.isComplete && (
                  <>
                    <button
                      className={styles.completeButton}
                      onClick={() => handleMarkComplete(tool.id)}
                    >
                      <CheckCircle2 size={16} />
                      Mark Complete
                    </button>
                    <button
                      className={styles.skipButton}
                      onClick={() => handleMarkComplete(tool.id, true)}
                    >
                      <SkipForward size={16} />
                      Skip
                    </button>
                  </>
                )}
                {completionStates[tool.id]?.progress > 0 && (
                  <div className={styles.progressIndicator}>
                    <div 
                      className={styles.progressBar}
                      style={{ width: `${completionStates[tool.id].progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.componentContainer}>
              <tool.component
                data={globalState.assessments[tool.id]}
                onChange={(data) => {
                  updateGlobalState({
                    assessments: {
                      ...globalState.assessments,
                      [tool.id]: data
                    }
                  });
                }}
              />
              {renderCompletionOverlay(tool.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentCarousel; 