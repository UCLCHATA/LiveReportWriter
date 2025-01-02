import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { GlobalFormState } from '../types/index';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';

interface ComponentProps {
  data: any;
  onChange: (data: any) => void;
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

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
}

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ onProgressUpdate }) => {
  const { globalState, setGlobalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(() => globalState.currentStep || 0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to calculate progress for each component
  const calculateComponentProgress = useCallback((component: any) => {
    if (!component) return 0;
    let progress = 0;

    switch (component.type) {
      case 'milestoneTracker':
        // Use the progress value directly from the milestone tracker
        if (component.progress !== undefined) {
          progress = component.progress;
          console.log('Using milestone progress:', progress);
        } else if (component.milestones) {
          // Fallback calculation if progress is not provided
          const placedCount = component.milestones.filter((m: any) => 
            m.actualAge !== null && m.actualAge !== undefined
          ).length;
          progress = Math.min(placedCount, 10);
          console.log('Calculated milestone progress:', progress);
        }
        break;

      case 'assessmentLog':
        const selectedAssessments = component.selectedAssessments || [];
        const entries = component.entries || {};
        
        if (selectedAssessments.length > 0) {
          progress += 1;
        }

        selectedAssessments.forEach((assessment: any) => {
          const entry = entries[assessment.id];
          if (entry) {
            if (entry.date) progress += 1;
            if (entry.notes?.trim().length > 0) progress += 2;
          }
        });
        break;

      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          let sliderProgress = 0;
          let observationProgress = 0;
          const domainCount = Object.keys(component.domains).length;

          Object.values(component.domains).forEach((domain: any) => {
            if (typeof domain.value === 'number' && domain.value !== 3) {
              sliderProgress += (1 / domainCount) * 6;
            }
            if (domain.observations?.length > 0) {
              observationProgress += (1 / domainCount) * 4;
            }
          });

          progress = sliderProgress + observationProgress;
        }
        break;
    }

    return Math.min(progress, 10);
  }, []);

  // Regular progress calculation for updates
  useEffect(() => {
    if (!isInitialized) return;
    
    const calculateProgress = () => {
      let totalProgress = 0;

      const components = {
        sensoryProfile: { ...globalState.assessments?.sensoryProfile, type: 'sensoryProfile' },
        socialCommunication: { ...globalState.assessments?.socialCommunication, type: 'socialCommunication' },
        behaviorInterests: { ...globalState.assessments?.behaviorInterests, type: 'behaviorInterests' },
        milestones: { 
          ...globalState.assessments?.milestones, 
          type: 'milestoneTracker',
          milestones: globalState.assessments?.milestones?.milestones || []
        },
        assessmentLog: { ...globalState.assessments?.assessmentLog, type: 'assessmentLog' }
      };

      Object.entries(components).forEach(([key, component]) => {
        if (component) {
          const componentProgress = calculateComponentProgress(component);
          totalProgress += componentProgress;
          console.log(`${key} Progress Update:`, {
            progress: componentProgress,
            total: totalProgress
          });
        }
      });

      return totalProgress;
    };

    const newProgress = calculateProgress();
    onProgressUpdate(newProgress);
  }, [
    isInitialized,
    globalState.assessments?.sensoryProfile,
    globalState.assessments?.socialCommunication,
    globalState.assessments?.behaviorInterests,
    globalState.assessments?.milestones?.milestones,
    globalState.assessments?.assessmentLog,
    onProgressUpdate,
    calculateComponentProgress
  ]);

  // Initial progress calculation on mount
  useEffect(() => {
    if (!isInitialized && globalState.assessments) {
      const calculateProgress = () => {
        let totalProgress = 0;
        const components = {
          sensoryProfile: { ...globalState.assessments?.sensoryProfile, type: 'sensoryProfile' },
          socialCommunication: { ...globalState.assessments?.socialCommunication, type: 'socialCommunication' },
          behaviorInterests: { ...globalState.assessments?.behaviorInterests, type: 'behaviorInterests' },
          milestones: { ...globalState.assessments?.milestones, type: 'milestoneTracker' },
          assessmentLog: { ...globalState.assessments?.assessmentLog, type: 'assessmentLog' }
        };

        Object.entries(components).forEach(([key, component]) => {
          if (component) {
            const componentProgress = calculateComponentProgress(component);
            totalProgress += componentProgress;
            console.log(`Initial ${key} Progress:`, componentProgress);
          }
        });

        return totalProgress;
      };

      const initialProgress = calculateProgress();
      if (initialProgress > 0) {
        onProgressUpdate(initialProgress);
      }
      setIsInitialized(true);
    }
  }, [globalState.assessments, isInitialized]);

  const handleComponentUpdate = (data: any) => {
    // Ensure type is set when updating component
    const updatedData = {
      ...data,
      type: tools[currentIndex].id
    };
    updateAssessment(tools[currentIndex].id, updatedData);
  };

  useEffect(() => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      currentStep: currentIndex
    }));
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev: number) => {
      const newIndex = prev === tools.length - 1 ? 0 : prev + 1;
      // Force progress recalculation on carousel change
      const newProgress = calculateProgress();
      onProgressUpdate(newProgress);
      return newIndex;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev: number) => {
      const newIndex = prev === 0 ? tools.length - 1 : prev - 1;
      // Force progress recalculation on carousel change
      const newProgress = calculateProgress();
      onProgressUpdate(newProgress);
      return newIndex;
    });
  };

  // Separate the progress calculation logic for reuse
  const calculateProgress = () => {
    let totalProgress = 0;
    const components = {
      sensoryProfile: { ...globalState.assessments?.sensoryProfile, type: 'sensoryProfile' },
      socialCommunication: { ...globalState.assessments?.socialCommunication, type: 'socialCommunication' },
      behaviorInterests: { ...globalState.assessments?.behaviorInterests, type: 'behaviorInterests' },
      milestones: { 
        ...globalState.assessments?.milestones, 
        type: 'milestoneTracker',
        milestones: globalState.assessments?.milestones?.milestones || []
      },
      assessmentLog: { ...globalState.assessments?.assessmentLog, type: 'assessmentLog' }
    };

    Object.entries(components).forEach(([key, component]) => {
      if (component) {
        const componentProgress = calculateComponentProgress(component);
        totalProgress += componentProgress;
        console.log(`${key} Progress:`, componentProgress);
      }
    });

    return totalProgress;
  };

  // Update progress when directly clicking an indicator
  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    const newProgress = calculateProgress();
    onProgressUpdate(newProgress);
  };

  const CurrentComponent = tools[currentIndex].component;

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselHeader}>
        <button onClick={handlePrevious} className={styles.navButton}>
          <ChevronLeft size={20} />
        </button>

        <div className={styles.titleSection}>
          <h2 className={styles.title}>{tools[currentIndex].title}</h2>
          <div className={styles.toolkitButton}>
            <HelpCircle size={20} />
            <div className={styles.toolkitTooltip}>{getTooltipContent(tools[currentIndex].title)}</div>
          </div>
        </div>

        <div className={styles.carouselIndicators}>
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
              onClick={() => handleIndicatorClick(index)}
              title={tool.title}
            />
          ))}
        </div>

        <button onClick={handleNext} className={styles.navButton}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.carouselContent}>
        <CurrentComponent
          data={globalState.assessments[tools[currentIndex].id]}
          onChange={handleComponentUpdate}
        />
      </div>
    </div>
  );
}; 