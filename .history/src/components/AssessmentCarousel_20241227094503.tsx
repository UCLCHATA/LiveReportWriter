import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLog } from './AssessmentLog';
import { AssessmentForm } from './AssessmentForm';
import styles from './AssessmentCarousel.module.css';

const tools = [
  {
    id: 'sensory',
    title: 'Sensory Profile',
    component: SensoryProfileBuilder,
    description: 'Evaluate sensory processing patterns'
  },
  {
    id: 'social',
    title: 'Social Communication',
    component: SocialCommunicationProfile,
    description: 'Assess social interaction and communication skills'
  },
  {
    id: 'behavior',
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
    id: 'assessments',
    title: 'Assessment Log',
    component: AssessmentLog,
    description: 'Record and monitor assessment progress'
  },
  {
    id: 'assessments',
    title: 'Assessment Form',
    component: AssessmentForm,
    description: 'Record and monitor assessment progress'
  }
];

export const AssessmentCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? tools.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tools.length - 1 ? 0 : prev + 1));
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
        <CurrentComponent />
      </div>
    </div>
  );
}; 