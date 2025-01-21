import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { GlobalFormState } from '../types/index';
import styles from './AssessmentCarousel.module.css';

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

  // Helper function to calculate progress for each component
  const calculateComponentProgress = (component: any): number => {
    if (!component) return 0;

    // For components with domains (Sensory, Social, Behavior)
    if (component.domains) {
      const totalFields = component.domains.length * 2; // Each domain has a value and observations
      let filledFields = 0;

      component.domains.forEach((domain: any) => {
        // Check if value is set and not zero (since zero is a valid value)
        if (typeof domain.value === 'number') filledFields++;
        // Check if observations array exists and has content
        if (domain.observations?.length > 0) filledFields++;
      });

      return filledFields / totalFields;
    }

    // For milestone tracker
    if (component.milestones) {
      const totalMilestones = component.milestones.length;
      if (totalMilestones === 0) return 0;
      const completedMilestones = component.milestones.filter((m: any) => 
        m.status === 'completed' || m.status === 'in-progress'
      ).length;
      return completedMilestones / totalMilestones;
    }

    // For assessment log
    if (component.entries) {
      const hasEntries = component.entries.length > 0;
      return hasEntries ? 1 : 0;
    }

    return 0;
  };

  // Calculate progress whenever relevant fields change
  useEffect(() => {
    let progress = 0;

    // Each component contributes 10% to total progress (50% total)
    const components = {
      sensory: globalState.assessments?.sensoryProfile,
      social: globalState.assessments?.socialCommunication,
      behavior: globalState.assessments?.behaviorInterests,
      milestones: globalState.assessments?.milestones,
      assessment: globalState.assessments?.assessmentLog
    };

    // Calculate individual component progress
    const componentProgress = Object.values(components).map(comp => calculateComponentProgress(comp));
    
    // Sum up all component progress and multiply by 10 to get percentage
    progress = componentProgress.reduce((sum, curr) => sum + curr, 0) * 10;

    // Ensure progress doesn't exceed 50%
    progress = Math.min(progress, 50);
    
    console.log('Component Progress:', {
      sensory: calculateComponentProgress(components.sensory) * 10,
      social: calculateComponentProgress(components.social) * 10,
      behavior: calculateComponentProgress(components.behavior) * 10,
      milestones: calculateComponentProgress(components.milestones) * 10,
      assessment: calculateComponentProgress(components.assessment) * 10,
      total: progress
    });

    onProgressUpdate(progress);
  }, [
    globalState.assessments?.sensoryProfile,
    globalState.assessments?.socialCommunication,
    globalState.assessments?.behaviorInterests,
    globalState.assessments?.milestones,
    globalState.assessments?.assessmentLog,
    onProgressUpdate
  ]);

  useEffect(() => {
    setGlobalState((prev: GlobalFormState) => ({
      ...prev,
      currentStep: currentIndex
    }));
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev: number) => (prev === 0 ? tools.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev: number) => (prev === tools.length - 1 ? 0 : prev + 1));
  };

  const handleComponentUpdate = (data: any) => {
    updateAssessment(tools[currentIndex].id, data);
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
              onClick={() => setCurrentIndex(index)}
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