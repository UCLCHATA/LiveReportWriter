import React, { useState } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { MilestoneTracker } from './MilestoneTracker';
import styles from './AssessmentCarousel.module.css';

const tools = [
  {
    id: 'sensory-profile',
    title: 'Sensory Profile',
    component: SensoryProfileBuilder,
    tooltip: 'Build a sensory profile by rating different sensory domains and adding observations.'
  },
  {
    id: 'milestones',
    title: 'Development Timeline',
    component: MilestoneTracker,
    tooltip: 'Track developmental milestones by dragging them to their observed ages.'
  }
];

export const AssessmentCarousel: React.FC = () => {
  const [currentTool, setCurrentTool] = useState(0);

  const nextTool = () => {
    setCurrentTool((prev) => (prev + 1) % tools.length);
  };

  const prevTool = () => {
    setCurrentTool((prev) => (prev - 1 + tools.length) % tools.length);
  };

  const CurrentToolComponent = tools[currentTool].component;

  return (
    <div className={styles['assessment-carousel']}>
      <div className={styles['carousel-navigation']}>
        <button 
          className={styles['nav-button']} 
          onClick={prevTool}
          disabled={currentTool === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <div className={styles['title-container']}>
          <h3 className={styles['tool-title']}>{tools[currentTool].title}</h3>
          <div className={styles['tooltip-wrapper']}>
            <HelpCircle className={styles['help-icon']} size={16} />
            <div className={styles['tooltip-content']}>{tools[currentTool].tooltip}</div>
          </div>
        </div>
        <button 
          className={styles['nav-button']} 
          onClick={nextTool}
          disabled={currentTool === tools.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className={styles['carousel-content']}>
        <CurrentToolComponent />
      </div>
      <div className={styles['carousel-indicators']}>
        {tools.map((tool, index) => (
          <button
            key={tool.id}
            className={`${styles['carousel-dot']} ${index === currentTool ? styles['active'] : ''}`}
            onClick={() => setCurrentTool(index)}
          />
        ))}
        <span className={styles['carousel-position']}>
          {currentTool + 1} of {tools.length}
        </span>
      </div>
    </div>
  );
}; 