import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';

interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social' | 'concerns';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: 'typical' | 'monitor' | 'delayed' | 'pending';
}

interface CategoryInfo {
  title: string;
  color: string;
  tooltips: { [key: string]: string };
}

type CategoryType = 'communication' | 'motor' | 'social' | 'concerns';

interface CategoryInfoMap {
  communication: CategoryInfo;
  motor: CategoryInfo;
  social: CategoryInfo;
  concerns: CategoryInfo;
}

const categoryInfo: CategoryInfoMap = {
  communication: {
    title: 'Communication',
    color: '#4299E1',
    tooltips: {
      'Babbling': 'Varied consonant-vowel combinations, speech-like sounds',
      'Name response': 'Consistently turns to name when called',
      'Points to show': 'Points to objects of interest to share attention',
      'First words': 'Uses specific words consistently with meaning',
      'Combines words': 'Puts two or more words together meaningfully'
    }
  },
  motor: {
    title: 'Motor Skills',
    color: '#48BB78',
    tooltips: {
      'Head control': 'Holds head steady without support',
      'Reaches & grasps': 'Actively reaches and grasps objects',
      'Independent sitting': 'Sits without support for extended period',
      'Independent walking': 'Walks without holding on',
      'Climbs & runs': 'Climbs furniture and runs steadily'
    }
  },
  social: {
    title: 'Social & Play',
    color: '#ED8936',
    tooltips: {
      'Social smile': 'Smiles in response to faces and voices',
      'Eye contact': 'Makes and maintains appropriate eye contact',
      'Imitation': 'Copies simple actions and expressions',
      'Pretend play': 'Engages in imaginative play with toys',
      'Interactive play': 'Plays cooperatively with others'
    }
  },
  concerns: {
    title: 'Developmental Concerns',
    color: '#9F7AEA',
    tooltips: {
      'Rigid play patterns': 'Repetitive play sequences, strong preference for sameness',
      'Limited social engagement': 'Reduced social initiation, parallel play preference',
      'Sensory seeking/avoiding': 'Unusual responses to sensory input, covering ears',
      'custom-concern': 'Add a custom developmental concern'
    }
  }
};

const TimelineMonth: React.FC<{ month: number; maxAge: number }> = ({ month, maxAge }) => {
  const { setNodeRef } = useDroppable({
    id: `month-${month}`,
  });

  const shouldShowMarker = month % 6 === 0;
  const shouldShowThreeMonthMarker = month % 3 === 0 && !shouldShowMarker;
  
  return (
    <div
      ref={setNodeRef}
      className={styles.monthMarker}
      style={{ 
        left: `${(month / maxAge) * 100}%`,
        opacity: shouldShowMarker ? 1 : shouldShowThreeMonthMarker ? 0.3 : 0
      }}
    >
      <div className={`${styles.markerLine} ${shouldShowThreeMonthMarker ? styles.threeMonthMarker : ''}`} />
      {shouldShowMarker && (
        <span className={styles.markerLabel}>
          {month % 12 === 0 ? `${month/12}y` : `${month}m`}
        </span>
      )}
    </div>
  );
};

const CurrentPositionIndicator: React.FC<{
  month: number;
  maxAge: number;
  category: CategoryType;
  verticalPosition: number;
}> = ({ month, maxAge, category, verticalPosition }) => {
  return (
    <div 
      className={styles.currentPosition}
      style={{ 
        left: `${(month / maxAge) * 100}%`,
        bottom: `${verticalPosition * 100}%`,
        borderColor: categoryInfo[category].color,
        backgroundColor: `${categoryInfo[category].color}22`
      }}
    >
      <span>{month}m</span>
      <div 
        className={styles.positionLine}
        style={{
          transform: `scaleY(${verticalPosition > 0.5 ? 1 : -1})`
        }}
      />
    </div>
  );
};

const DraggableMilestone: React.FC<{ 
  milestone: Milestone;
  category: CategoryType;
  onCustomConcern?: (text: string) => void;
}> = ({ milestone, category, onCustomConcern }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showDifference, setShowDifference] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone },
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
          placeholder="Type concern and press Enter"
          className={styles.customInput}
        />
      ) : (
        <>
          {milestone.title}
          {milestone.actualAge !== undefined && (
            <div 
              className={styles.monthCircle}
              data-delayed={isDelayed}
              data-early={isEarly}
              onMouseEnter={() => setShowDifference(true)}
              onMouseLeave={() => setShowDifference(false)}
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

const getStackPosition = (
  milestones: Milestone[], 
  currentMonth: number, 
  currentId: string
): number => {
  const placedMilestones = milestones
    .filter(m => m.actualAge !== undefined && m.id !== currentId);

  let row = 0;
  let hasOverlap = true;

  while (hasOverlap) {
    hasOverlap = placedMilestones.some((m: Milestone) => {
      const distance = Math.abs((m.actualAge || 0) - currentMonth);
      const mightOverlap = distance <= 20;
      
      const sameRow = milestones
        .find((existing: Milestone) => existing.id === m.id)?.stackPosition === row;

      return mightOverlap && sameRow;
    });

    if (hasOverlap) {
      row++;
    }
  }

  return row;
};

const determineStatus = (actualAge: number, expectedAge: number): 'typical' | 'monitor' | 'delayed' => {
  const difference = actualAge - expectedAge;
  if (difference <= 1) return 'typical';
  if (difference <= 3) return 'monitor';
  return 'delayed';
};

export const MilestoneTracker: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const { globalState, updateAssessment } = useFormState();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const maxAge = 72;

  const milestones = globalState.assessments?.milestones?.milestones || [];

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const month = parseInt(over.id.toString().replace('month-', ''));
    
    const draggedMilestone = milestones.find((m: Milestone) => m.id === active.id);
    if (!draggedMilestone) return;

    const updatedMilestones = milestones.map((m: Milestone) => 
      m.id === active.id ? {
        ...m,
        actualAge: month,
        stackPosition: getStackPosition(milestones, month, active.id.toString())
      } : m
    );

    // Update both local state and parent
    updateAssessment('milestones', {
      type: 'milestoneTracker',
      milestones: updatedMilestones
    });

    // Notify parent of change
    if (onChange) {
      onChange({
        type: 'milestoneTracker',
        milestones: updatedMilestones
      });
    }

    setActiveMilestone(null);
    setCurrentMonth(null);
  }, [milestones, updateAssessment, onChange]);

  const handleDragStart = useCallback((event: DragEndEvent) => {
    const draggedMilestone = milestones.find((m: Milestone) => m.id === event.active.id);
    setActiveMilestone(draggedMilestone || null);
  }, [milestones]);

  const handleDragMove = useCallback((event: DragEndEvent) => {
    if (!event.over) return;
    const month = parseInt(event.over.id.toString().replace('month-', ''));
    
    const timeline = document.querySelector(`.${styles.timeline}`);
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const y = rect.height - Math.min(Math.max((event as any).clientY - rect.top, 0), rect.height);
      setCurrentMonth(month);
      setVerticalPosition(y / rect.height);
    }
  }, []);

  return (
    <div className={styles.container}>
      <DndContext 
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.categoriesContainer}>
          {(Object.entries(categoryInfo) as [CategoryType, CategoryInfo][]).map(([category, info]) => (
            <div key={category} className={styles.category}>
              <h3>{info.title}</h3>
              <div className={styles.milestoneList}>
                {milestones
                  .filter((m: Milestone) => m.category === category && !m.actualAge)
                  .map((milestone: Milestone) => (
                    <DraggableMilestone
                      key={milestone.id}
                      milestone={milestone}
                      category={category}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.timelineContainer}>
          <div className={styles.timeline}>
            {Array.from({ length: maxAge + 1 }, (_, i) => (
              <TimelineMonth key={i} month={i} maxAge={maxAge} />
            ))}

            {activeMilestone && (
              <div 
                className={styles.expectedAgeIndicator}
                style={{ 
                  left: `${(activeMilestone.expectedAge / maxAge) * 100}%`,
                  backgroundColor: categoryInfo[activeMilestone.category].color
                }}
              >
                <div className={styles.indicatorLabel}>
                  Expected: {activeMilestone.expectedAge}m
                </div>
              </div>
            )}

            {activeMilestone && currentMonth !== null && (
              <CurrentPositionIndicator 
                month={currentMonth}
                maxAge={maxAge}
                category={activeMilestone.category}
                verticalPosition={verticalPosition}
              />
            )}

            <div className={styles.placedMilestones}>
              <AnimatePresence>
                {milestones
                  .filter((m: Milestone) => m.actualAge !== undefined)
                  .map((milestone: Milestone) => (
                    <motion.div
                      key={milestone.id}
                      className={styles.timelineMilestone}
                      style={{
                        left: `${(milestone.actualAge || 0) / maxAge * 100}%`,
                        top: `${(milestone.stackPosition || 0) * 30}px`
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <DraggableMilestone
                        milestone={milestone}
                        category={milestone.category}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default MilestoneTracker; 