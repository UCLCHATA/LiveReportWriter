import React, { useState, useEffect } from 'react';
import { Milestone } from '../types';
import styles from './MilestoneTracker.module.css';
import { DraggableMilestone } from './DraggableMilestone';

interface Props {
  milestones: Milestone[];
  onMilestoneChange: (milestone: Milestone) => void;
  onHistoryChange: (history: string) => void;
  history: string;
}

const MilestoneTracker: React.FC<Props> = ({
  milestones,
  onMilestoneChange,
  onHistoryChange,
  history
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDrop = (milestone: Milestone, actualAge: number) => {
    onMilestoneChange({
      ...milestone,
      actualAge,
      status: actualAge > milestone.expectedAge ? 'delayed' : 'typical'
    });
  };

  const handleHistoryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onHistoryChange(event.target.value);
  };

  const categories = {
    communication: milestones.filter(m => m.category === 'communication'),
    motor: milestones.filter(m => m.category === 'motor'),
    social: milestones.filter(m => m.category === 'social'),
    concerns: milestones.filter(m => m.category === 'concerns')
  };

  return (
    <div className={styles.container}>
      <div className={styles.categoriesContainer}>
        <div className={`${styles.category} ${styles.communication}`}>
          <h3>Communication</h3>
          <div className={styles.milestoneList}>
            {categories.communication.map(milestone => (
              <DraggableMilestone
                key={milestone.id}
                milestone={milestone}
                onDrop={handleDrop}
                onHover={setHoveredMilestone}
              />
            ))}
          </div>
        </div>
        <div className={`${styles.category} ${styles.motor}`}>
          <h3>Motor</h3>
          <div className={styles.milestoneList}>
            {categories.motor.map(milestone => (
              <DraggableMilestone
                key={milestone.id}
                milestone={milestone}
                onDrop={handleDrop}
                onHover={setHoveredMilestone}
              />
            ))}
          </div>
        </div>
        <div className={`${styles.category} ${styles.social}`}>
          <h3>Social</h3>
          <div className={styles.milestoneList}>
            {categories.social.map(milestone => (
              <DraggableMilestone
                key={milestone.id}
                milestone={milestone}
                onDrop={handleDrop}
                onHover={setHoveredMilestone}
              />
            ))}
          </div>
        </div>
        <div className={`${styles.category} ${styles.concerns}`}>
          <h3>Concerns</h3>
          <div className={styles.milestoneList}>
            {categories.concerns.map(milestone => (
              <DraggableMilestone
                key={milestone.id}
                milestone={milestone}
                onDrop={handleDrop}
                onHover={setHoveredMilestone}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.timelineContainer}>
        <div className={styles.timelineWrapper}>
          <div className={styles.timeline}>
            {Array.from({ length: 37 }, (_, i) => (
              <div key={i} className={styles.monthMarker}>
                <div className={styles.markerLine} />
                <span className={styles.markerLabel}>{i}</span>
              </div>
            ))}
            {milestones
              .filter(m => m.actualAge !== undefined)
              .map(milestone => (
                <div
                  key={milestone.id}
                  className={`${styles.placedMilestone} ${
                    milestone.status === 'delayed' ? styles.delayed : ''
                  }`}
                  style={{
                    left: `${(milestone.actualAge || 0) * (100 / 36)}%`
                  }}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                >
                  <div className={styles.monthCircle}>
                    <span className={styles.monthText}>
                      {milestone.actualAge !== undefined &&
                        milestone.expectedAge !== undefined &&
                        `${Math.abs(milestone.actualAge - milestone.expectedAge)} months ${
                          milestone.actualAge > milestone.expectedAge ? 'delayed' : 'early'
                        }`}
                    </span>
                  </div>
                  <div className={styles.milestoneTitle}>{milestone.title}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className={styles.historyBox}>
        <h3>History of Concerns</h3>
        <div className={styles.historyContent}>
          <textarea
            value={history}
            onChange={handleHistoryChange}
            placeholder="Document any concerns or observations here..."
            className={styles.historyTextarea}
          />
        </div>
      </div>
    </div>
  );
};

export default MilestoneTracker; 