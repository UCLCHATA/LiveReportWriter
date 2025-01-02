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

  // Memoized progress calculation for individual components
  const calculateComponentProgress = useCallback((component: any) => {
    if (!component) return 0;
    let progress = 0;

    switch (component.type) {
      case 'milestoneTracker':
        if (component.milestones && Array.isArray(component.milestones)) {
          const placedCount = component.milestones.filter((m: any) => 
            typeof m.actualAge === 'number'
          ).length;
          
          // Each placed milestone contributes 1%
          progress = Math.min(placedCount, 10);
          
          console.log('Milestone Progress Calculation:', { 
            type: component.type,
            totalMilestones: component.milestones.length,
            placedCount,
            progress,
            milestones: component.milestones.map((m: any) => ({
              id: m.id,
              actualAge: m.actualAge,
              isPlaced: typeof m.actualAge === 'number'
            }))
          });
        }
        break;

      case 'assessmentLog':
        const selectedAssessments = component.selectedAssessments || [];
        const entries = component.entries || {};
        
        // 2% for selecting assessments (up to 5 selections = 10%)
        progress += Math.min((selectedAssessments.length / 5) * 10, 10);

        // Additional progress for complete entries
        let entryProgress = 0;
        selectedAssessments.forEach((assessment: any) => {
          const entry = entries[assessment.id];
          if (entry) {
            if (entry.date) entryProgress += 1;
            if (entry.notes?.trim().length > 0) entryProgress += 1;
          }
        });
        // Scale entry progress to contribute up to 10%
        progress = Math.min(progress + (entryProgress / 10) * 10, 10);
        console.log('Assessment Log Progress:', { selections: selectedAssessments.length, entries: entryProgress, progress });
        break;

      case 'sensoryProfile':
      case 'socialCommunication':
      case 'behaviorInterests':
        if (component.domains) {
          const domains = Object.values(component.domains);
          const domainCount = domains.length;
          
          // Count completed sliders (non-default values)
          const completedSliders = domains.filter((domain: any) => 
            typeof domain.value === 'number' && domain.value !== 3
          ).length;
          
          // Count domains with observations
          const domainsWithObservations = domains.filter((domain: any) => 
            domain.observations?.length > 0
          ).length;
          
          // Sliders contribute 60% of the progress (6% total)
          const sliderProgress = (completedSliders / domainCount) * 6;
          
          // Observations contribute 40% of the progress (4% total)
          const observationProgress = (domainsWithObservations / domainCount) * 4;
          
          progress = Math.min(sliderProgress + observationProgress, 10);
          console.log(`${component.type} Progress:`, {
            domains: domainCount,
            completedSliders,
            domainsWithObservations,
            sliderProgress,
            observationProgress,
            total: progress
          });
        }
        break;
    }

    return progress;
  }, []);

  // Memoized total progress calculation
  const calculateTotalProgress = useCallback(() => {
    if (!globalState.assessments) return 0;

    const components = {
      sensoryProfile: { ...globalState.assessments.sensoryProfile, type: 'sensoryProfile' },
      socialCommunication: { ...globalState.assessments.socialCommunication, type: 'socialCommunication' },
      behaviorInterests: { ...globalState.assessments.behaviorInterests, type: 'behaviorInterests' },
      milestones: { 
        type: 'milestoneTracker',
        milestones: globalState.assessments.milestones?.milestones || []
      },
      assessmentLog: { ...globalState.assessments.assessmentLog, type: 'assessmentLog' }
    };

    let totalProgress = 0;
    Object.entries(components).forEach(([key, component]) => {
      if (component) {
        const componentProgress = calculateComponentProgress(component);
        totalProgress += componentProgress;
        console.log(`Progress for ${key}:`, componentProgress, 'Total:', totalProgress);
      }
    });

    return totalProgress;
  }, [globalState.assessments, calculateComponentProgress]);

  // Initial load effect
  useEffect(() => {
    if (!isInitialized && globalState.assessments) {
      const initialProgress = calculateTotalProgress();
      onProgressUpdate(initialProgress);
      setIsInitialized(true);
    }
  }, [globalState.assessments, isInitialized, calculateTotalProgress, onProgressUpdate]);

  // Effect to handle all assessment updates
  useEffect(() => {
    if (!isInitialized) return;
    
    const newProgress = calculateTotalProgress();
    console.log('Total Progress Updated:', newProgress);
    onProgressUpdate(newProgress);
  }, [
    isInitialized,
    calculateTotalProgress,
    onProgressUpdate,
    globalState.assessments?.sensoryProfile,
    globalState.assessments?.socialCommunication,
    globalState.assessments?.behaviorInterests,
    globalState.assessments?.milestones,
    globalState.assessments?.assessmentLog
  ]);

  // Simplified navigation handlers
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
    
    // Special handling for milestone tracker to ensure proper state structure
    if (componentId === 'milestones') {
      const updatedData = {
        type: 'milestoneTracker',
        milestones: data.milestones || []
      };
      console.log('Updating Milestones:', updatedData);
      updateAssessment(componentId, updatedData);
    } else {
      // Normal handling for other components
      const updatedData = {
        ...data,
        type: componentId
      };
      updateAssessment(componentId, updatedData);
    }
  };

  useEffect(() => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      currentStep: currentIndex
    }));
  }, [currentIndex]);

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