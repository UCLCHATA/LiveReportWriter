import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import styles from './MilestoneTracker.module.css';
import { categoryInfo, CategoryType } from './MilestoneTracker';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: {
      type: 'milestone',
      milestone,
      category,
    },
    disabled: milestone.id === 'custom-concern' || isEditing
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}`
    : categoryInfo[category as CategoryType]?.tooltips[milestone.title] || '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customText.trim()) {
      e.preventDefault();
      e.stopPropagation();
      onCustomConcern?.(customText.trim());
      setCustomText('');
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCustomText('');
    }
  };

  const handleCustomClick = (e: React.MouseEvent) => {
    if (milestone.id === 'custom-concern' && !isEditing) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (customText.trim()) {
      onCustomConcern?.(customText.trim());
    }
    setCustomText('');
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

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
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''} ${isEditing ? styles.editing : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      data-early={isEarly}
      data-delayed={isDelayed}
      data-tooltip={tooltipText}
      {...attributes}
      {...listeners}
      whileHover={{ scale: isEditing ? 1 : 1.05 }}
      whileTap={{ scale: isEditing ? 1 : 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCustomClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={styles.customInput}
          placeholder="Type concern and press Enter"
          maxLength={50}
        />
      ) : (
        <>
          {milestone.title}
          {milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (
            <div 
              className={styles.monthCircle}
            >
              <span 
                className={`${styles.monthText} ${isHovered ? styles.showDifference : ''}`}
                data-delayed={isDelayed}
                data-early={isEarly}
              >
                {isHovered && differenceText ? differenceText : `${milestone.actualAge}m`}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}; 