import React, { useState } from 'react';
import styles from './BehavioralAssessment.module.css';
import headerStyles from './CarouselHeader.module.css';

type TimelineItem = {
  category: string;
  milestones: {
    label: string;
    achieved: boolean;
    ageInMonths: number;
  }[];
};

export const BehavioralAssessment: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      category: 'Social',
      milestones: [
        { label: 'Social smile', achieved: false, ageInMonths: 0 },
        { label: 'Stranger anxiety', achieved: false, ageInMonths: 0 },
        { label: 'Parallel play', achieved: false, ageInMonths: 0 },
      ],
    },
    {
      category: 'Motor',
      milestones: [
        { label: 'Rolling over', achieved: false, ageInMonths: 0 },
        { label: 'Crawling', achieved: false, ageInMonths: 0 },
        { label: 'Walking independently', achieved: false, ageInMonths: 0 },
      ],
    },
    {
      category: 'Communication',
      milestones: [
        { label: 'First words', achieved: false, ageInMonths: 0 },
        { label: 'Two-word phrases', achieved: false, ageInMonths: 0 },
        { label: 'Complex sentences', achieved: false, ageInMonths: 0 },
      ],
    },
  ]);

  const handleMilestoneChange = (
    categoryIndex: number,
    milestoneIndex: number,
    achieved: boolean,
    ageInMonths: number
  ) => {
    const newTimeline = [...timeline];
    newTimeline[categoryIndex].milestones[milestoneIndex] = {
      ...newTimeline[categoryIndex].milestones[milestoneIndex],
      achieved,
      ageInMonths,
    };
    setTimeline(newTimeline);
  };

  return (
    <div className={styles.behavioralAssessment}>
      <header className={headerStyles.carouselHeader}>
        <button className={headerStyles.navButton}>
          <span>←</span>
        </button>
        
        <div className={headerStyles.titleSection}>
          <h2 className={headerStyles.title}>Behavioral Assessment</h2>
          <button className={headerStyles.toolkitButton}>
            <span>ℹ️</span>
            <span>Toolkit</span>
          </button>
        </div>

        <div className={headerStyles.carouselIndicators}>
          {[1, 2, 3].map((_, index) => (
            <div 
              key={index} 
              className={`${headerStyles.indicator} ${index === 0 ? headerStyles.active : ''}`}
            />
          ))}
        </div>

        <button className={headerStyles.navButton}>
          <span>→</span>
        </button>
      </header>

      {timeline.map((category, categoryIndex) => (
        <div key={category.category} className={styles.timelineContainer}>
          <h3>{category.category}</h3>
          {category.milestones.map((milestone, milestoneIndex) => (
            <div key={milestone.label} className={styles.timelineRow}>
              <div className={styles.timelineLabel}>{milestone.label}</div>
              <div className={styles.timelineTrack}>
                <input
                  type="checkbox"
                  checked={milestone.achieved}
                  onChange={(e) =>
                    handleMilestoneChange(
                      categoryIndex,
                      milestoneIndex,
                      e.target.checked,
                      milestone.ageInMonths
                    )
                  }
                />
                <input
                  type="number"
                  value={milestone.ageInMonths}
                  onChange={(e) =>
                    handleMilestoneChange(
                      categoryIndex,
                      milestoneIndex,
                      milestone.achieved,
                      Number(e.target.value)
                    )
                  }
                  placeholder="Age in months"
                  min="0"
                  max="36"
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}; 