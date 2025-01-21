import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import styles from './MilestoneTracker.module.css';

interface Milestone {
  id: number;
  milestone: string;
  expectedAge: number;
  actualAge: number | null;
}

type MilestoneCategory = {
  [key: string]: Milestone[];
};

const tooltipText = {
  main: "Drag and drop milestones onto the timeline to record when they occurred. The expected age is shown by the milestone's initial position.",
  communication: "Track the development of speech and language skills",
  motor: "Track physical movement and coordination development",
  social: "Track social interaction and emotional development"
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneCategory>({
    communication: [
      { id: 1, milestone: "First words", expectedAge: 12, actualAge: null },
      { id: 2, milestone: "Two-word phrases", expectedAge: 24, actualAge: null },
      { id: 3, milestone: "Complex sentences", expectedAge: 36, actualAge: null }
    ],
    motor: [
      { id: 4, milestone: "Rolling over", expectedAge: 6, actualAge: null },
      { id: 5, milestone: "Crawling", expectedAge: 9, actualAge: null },
      { id: 6, milestone: "Walking independently", expectedAge: 12, actualAge: null }
    ],
    social: [
      { id: 7, milestone: "Social smile", expectedAge: 2, actualAge: null },
      { id: 8, milestone: "Stranger anxiety", expectedAge: 8, actualAge: null },
      { id: 9, milestone: "Parallel play", expectedAge: 24, actualAge: null }
    ]
  });

  const [draggedMilestone, setDraggedMilestone] = useState<{category: string; id: number} | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, category: string, id: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, id }));
    setDraggedMilestone({ category, id });
  };

  const handleDrop = (e: React.DragEvent, monthPoint: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { category, id } = data;
    
    setMilestones(prev => ({
      ...prev,
      [category]: prev[category].map(m => 
        m.id === id ? { ...m, actualAge: monthPoint } : m
      )
    }));
    setDraggedMilestone(null);
    setHoveredMonth(null);
  };

  const handleDragOver = (e: React.DragEvent, month: number) => {
    e.preventDefault();
    setHoveredMonth(month);
  };

  const handleDragEnd = () => {
    setDraggedMilestone(null);
    setHoveredMonth(null);
  };

  const formatMonth = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years}y ${remainingMonths}m`;
  };

  const TimelineGrid: React.FC = () => {
    const months = Array.from({ length: 48 }, (_, i) => i);
    
    return (
      <div className={styles['timeline-grid']}>
        <div className={styles['timeline-months']}>
          {months.map(month => {
            const milestone = draggedMilestone && 
              milestones[draggedMilestone.category].find(m => m.id === draggedMilestone.id);
            const isExpectedAge = milestone?.expectedAge === month;
            
            return (
              <div
                key={month}
                className={`${styles['timeline-month']} 
                  ${isExpectedAge ? styles['expected-age'] : ''} 
                  ${hoveredMonth === month ? styles['month-hovered'] : ''}`}
                onDragOver={(e) => handleDragOver(e, month)}
                onDrop={(e) => handleDrop(e, month)}
                data-month={month}
              >
                {month % 12 === 0 && (
                  <span className={styles['year-marker']}>
                    {month / 12}y
                  </span>
                )}
                {isExpectedAge && (
                  <div className={styles['expected-marker']}>Expected</div>
                )}
                {hoveredMonth === month && (
                  <div className={styles['hover-marker']}>{formatMonth(month)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles['milestone-content']}>
      {Object.entries(milestones).map(([category, categoryMilestones]) => (
        <div key={category} className={styles['milestone-category']}>
          <div className={styles['category-header']}>
            <h4 className={styles['category-title']}>{category}</h4>
            <div className={styles['tooltip-wrapper']}>
              <HelpCircle className={styles['help-icon']} size={14} />
              <div className={styles['tooltip-content']}>{tooltipText[category as keyof typeof tooltipText]}</div>
            </div>
          </div>
          <div className={styles['milestones-list']}>
            {categoryMilestones.map(milestone => (
              <div
                key={milestone.id}
                draggable
                onDragStart={(e) => handleDragStart(e, category, milestone.id)}
                onDragEnd={handleDragEnd}
                className={`${styles['milestone-item']} 
                  ${milestone.actualAge !== null ? styles['milestone-placed'] : ''}
                  ${draggedMilestone?.id === milestone.id ? styles['milestone-dragging'] : ''}`}
                style={{
                  '--expected-month': `${(milestone.expectedAge / 48) * 100}%`
                } as React.CSSProperties}
              >
                <span className={styles['milestone-text']}>{milestone.milestone}</span>
                {milestone.actualAge !== null && (
                  <span className={styles['milestone-age']}>{formatMonth(milestone.actualAge)}</span>
                )}
                {milestone.actualAge === null && (
                  <span className={styles['milestone-expected']}>Expected: {formatMonth(milestone.expectedAge)}</span>
                )}
              </div>
            ))}
          </div>
          <TimelineGrid />
        </div>
      ))}
    </div>
  );
};

export default MilestoneTracker; 