import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import styles from './MilestoneTracker.module.css';
import { Milestone, CategoryType } from './types';

interface DraggableMilestoneProps {
  milestone: Milestone;
  category: CategoryType;
  onCustomConcern?: (text: string) => void;
}

export const DraggableMilestone: React.FC<DraggableMilestoneProps> = ({
  milestone,
  category,
  onCustomConcern
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showDifference, setShowDifference] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone },
    disabled: milestone.id === 'custom-concern' || isEditing
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000
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

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}${
      differenceText ? ` - ${isDelayed ? 'Delayed' : 'Advanced'} by ${Math.abs(milestone.actualAge - milestone.expectedAge)}m` : ''
    }`
    : categoryInfo[category].tooltips[milestone.title];

  const isEarly = milestone.actualAge !== undefined && 
                  milestone.expectedAge !== 0 && 
                  milestone.actualAge < milestone.expectedAge;

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
      setTimeout(() => inputRef.current?.focus(), 0);
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
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const isCustom = milestone.id.startsWith('custom-concern-');
  const isCustomButton = milestone.id === 'custom-concern';

  return (
    <motion.div
      ref={isCustomButton ? undefined : setNodeRef}
      {...(!isCustomButton && !isEditing ? { ...attributes, ...listeners } : {})}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      data-custom={isCustom}
      data-early={isEarly}
      data-tooltip={tooltipText}
      style={style}
      title={milestone.actualAge !== undefined ? tooltipText : undefined}
      whileHover={{ scale: isCustomButton ? 1 : 1.05 }}
      whileTap={{ scale: isCustomButton ? 1 : 0.95 }}
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
          autoFocus
        />
      ) : (
        <>
          {milestone.title}
          {milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (
            <div 
              className={styles.monthCircle}
              onMouseEnter={() => setShowDifference(true)}
              onMouseLeave={() => setShowDifference(false)}
              data-delayed={isDelayed}
              data-early={isEarly}
            >
              <span className={`${styles.monthText} ${showDifference ? styles.showDifference : ''}`}>
                {showDifference && differenceText ? differenceText : `${milestone.actualAge}m`}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DraggableMilestone; 