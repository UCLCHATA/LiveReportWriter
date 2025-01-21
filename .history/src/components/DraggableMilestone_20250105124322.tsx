import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import styles from './MilestoneTracker.module.css';

interface DraggableMilestoneProps {
  milestone: {
    id: string;
    title: string;
    category: string;
    actualAge?: number;
    expectedAge: number;
    status?: 'typical' | 'monitor' | 'delayed' | 'pending';
  };
  category: string;
  onCustomConcern?: (text: string) => void;
}

export const DraggableMilestone: React.FC<DraggableMilestoneProps> = ({ 
  milestone, 
  category,
  onCustomConcern
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: {
      type: 'milestone',
      milestone,
      category,
    },
    disabled: milestone.id === 'custom-concern'
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getDifferenceText = () => {
    if (milestone.actualAge === undefined || milestone.expectedAge === 0) return null;
    const diff = milestone.actualAge - milestone.expectedAge;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const differenceText = getDifferenceText();
  const isDelayed = milestone.actualAge !== undefined && 
                    milestone.expectedAge !== 0 && 
                    milestone.actualAge > milestone.expectedAge;

  const isEarly = milestone.actualAge !== undefined && 
                  milestone.expectedAge !== 0 && 
                  milestone.actualAge < milestone.expectedAge;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      data-early={isEarly}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {milestone.title}
      {milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (
        <div 
          className={styles.monthCircle}
          data-delayed={isDelayed}
          data-early={!isDelayed}
        >
          <span className={styles.monthText}>
            {differenceText ? differenceText : `${milestone.actualAge}m`}
          </span>
        </div>
      )}
    </motion.div>
  );
}; 