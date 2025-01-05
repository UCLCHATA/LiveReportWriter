import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import styles from './MilestoneTracker.module.css';

interface DraggableMilestoneProps {
  milestone: {
    id: string;
    name: string;
    category: string;
    actualAge?: number;
    status?: 'typical' | 'monitor' | 'delayed' | 'pending';
  };
  category: string;
  onDelete?: () => void;
}

export const DraggableMilestone: React.FC<DraggableMilestoneProps> = ({ milestone, category, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: {
      type: 'milestone',
      milestone,
      category,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = (e: React.MouseEvent) => {
    // Check if click was on the delete button (the pseudo-element)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isDeleteClick = 
      e.clientX >= rect.right - 24 && 
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.top + 24;

    if (isDeleteClick && onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };

  const getStatusColor = () => {
    switch (milestone.status) {
      case 'typical':
        return '#10B981'; // Green
      case 'monitor':
        return '#F59E0B'; // Yellow
      case 'delayed':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray for pending
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      onClick={handleClick}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {milestone.name}
      {milestone.actualAge !== undefined && (
        <div 
          className={styles.monthCircle}
          style={{
            backgroundColor: getStatusColor(),
            color: 'white',
            border: 'none'
          }}
        >
          <span className={styles.monthText}>{milestone.actualAge}m</span>
          {onDelete && (
            <span className={styles.deleteIcon}>×</span>
          )}
        </div>
      )}
    </motion.div>
  );
}; 