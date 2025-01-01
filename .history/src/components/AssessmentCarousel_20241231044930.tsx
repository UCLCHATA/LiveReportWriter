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

export const AssessmentCarousel: React.FC = () => {
  const { globalState, setGlobalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(() => globalState.currentStep || 0);

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
        <div className={styles.titleContainer}>
          <h2>{tools[currentIndex].title}</h2>
          <div className={styles.tooltipWrapper}>
            <HelpCircle className={styles.helpIcon} size={16} />
            <div className={styles.tooltipContent}>
              {tools[currentIndex].description}
            </div>
          </div>
        </div>

        <div className={styles.navigation}>
          <button onClick={handlePrevious} className={styles.navButton}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.indicators}>
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