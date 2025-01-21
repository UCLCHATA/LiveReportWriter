import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styles from './MilestoneTracker.module.css';

interface DraggableMilestoneProps {
  milestone: {
    id: string;
    name: string;
    category: string;
    actualAge?: number;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.milestone}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {milestone.name}
    </div>
  );
}; 