import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
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
      'First words': 'Look for intentional use of words like "mama", "dada", "no"',
      'Two-word phrases': 'Examples: "more milk", "car go", "daddy up"',
      'Complex sentences': 'Should use pronouns, plurals, and basic prepositions',
      'Follows commands': 'Check for understanding of basic instructions without gestures',
      'Uses gestures': 'Look for pointing, waving, reaching with intent'
    }
  },
  motor: {
    title: 'Motor Skills',
    color: '#48BB78',
    tooltips: {
      'Rolling over': 'Should roll both ways - back to front and front to back',
      'Sitting': 'Look for independent sitting without support',
      'Crawling': 'Check for coordinated movement using both arms and legs',
      'Walking': 'Observe balance and confidence in steps',
      'Running': 'Note coordination and speed control'
    }
  },
  social: {
    title: 'Social & Emotional',
    color: '#ED8936',
    tooltips: {
      'Social smile': 'Responds to faces with genuine smile',
      'Stranger anxiety': 'Shows clear preference for familiar people',
      'Parallel play': 'Plays alongside but not with other children',
      'Cooperative play': 'Engages in games with rules and turn-taking',
      'Shows empathy': 'Recognizes and responds to others\' emotions'
    }
  },
  concerns: {
    title: 'Developmental Concerns',
    color: '#9F7AEA',
    tooltips: {
      'Sensory responses': 'Unusual reactions to sensory input (hyper/hypo-sensitivity to sounds, textures, lights)',
      'Restricted interests': 'Intense focus on specific topics or objects, resistance to change in routines',
      'Social reciprocity': 'Limited sharing of interests, emotions, or affect with others'
    }
  }
};

interface TimelineItem {
  id: string;
  content: string;
  start: number;
  group: string;
  className: string;
  title?: string;
  expectedAge?: number;
  actualAge?: number;
}

interface TimelineGroup {
  id: string;
  content: string;
  className?: string;
}

interface DragEvent {
  active: { id: string };
  over: { id: string } | null;
  clientY: number;
}

const TimelineMonth: React.FC<{ month: number; maxAge: number }> = ({ month, maxAge }) => {
  const { setNodeRef } = useDroppable({
    id: `month-${month}`,
  });

  const shouldShowMarker = month % 6 === 0;
  
  return (
    <div
      ref={setNodeRef}
      className={styles.monthMarker}
      style={{ 
        left: `${(month / maxAge) * 100}%`,
        opacity: shouldShowMarker ? 1 : 0
      }}
    >
      {shouldShowMarker && (
        <>
          <div className={styles.markerLine} />
          <span className={styles.markerLabel}>
            {month % 12 === 0 ? `${month/12}y` : `${month}m`}
          </span>
        </>
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m\nExpected: ${milestone.expectedAge}m` 
    : milestone.id === 'custom-concern' ? 'Enter custom text' : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customText.trim()) {
      onCustomConcern?.(customText.trim());
      setCustomText('');
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCustomText('');
    }
  };

  const handleCustomClick = (e: React.MouseEvent) => {
    if (milestone.id === 'custom-concern') {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <motion.div
      ref={setNodeRef}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      style={style}
      title={tooltipText}
      whileHover={{ scale: milestone.id === 'custom-concern' ? 1 : 1.05 }}
      whileTap={{ scale: milestone.id === 'custom-concern' ? 1 : 0.95 }}
      onClick={handleCustomClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          className={styles.customInput}
          placeholder="Type and press Enter"
          maxLength={50}
        />
      ) : (
        <>
          {milestone.title}
          {milestone.actualAge !== undefined && (
            <div className={styles.monthCircle}>
              <span className={styles.monthText}>{milestone.actualAge}m</span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

const CARD_WIDTH = 120; // Approximate width of a milestone card in pixels
const MONTH_WIDTH = 1.4; // Width of one month in percentage of timeline

const getStackPosition = (
  milestones: Milestone[], 
  currentMonth: number, 
  currentId: string
): number => {
  const draggedMilestone = milestones.find(m => m.id === currentId);
  if (!draggedMilestone) return 0;

  const isDelayed = currentMonth > (draggedMilestone.expectedAge || 0);
  const placedMilestones = milestones
    .filter(m => m.actualAge !== undefined && m.id !== currentId)
    .filter(m => (m.actualAge || 0) > (m.expectedAge || 0) === isDelayed); // Group by delayed/early

  let row = isDelayed ? 0 : 6; // Start from top for delayed, bottom for early
  let hasOverlap = true;
  const maxRows = 7;
  const direction = isDelayed ? 1 : -1; // Move down for delayed, up for early

  while (hasOverlap && Math.abs(row) < maxRows) {
    hasOverlap = placedMilestones.some((m: Milestone) => {
      const distance = Math.abs((m.actualAge || 0) - currentMonth);
      const mightOverlap = distance <= 20;
      
      const sameRow = milestones
        .find((existing: Milestone) => existing.id === m.id)?.stackPosition === row;

      return mightOverlap && sameRow;
    });

    if (hasOverlap) {
      row += direction;
    }
  }

  // If we've hit the limit, find the least crowded row in our section
  if (Math.abs(row) >= maxRows) {
    const rowCounts = new Array(maxRows).fill(0);
    placedMilestones.forEach(m => {
      const mRow = m.stackPosition || 0;
      if (Math.abs(mRow) < maxRows) {
        rowCounts[Math.abs(mRow)]++;
      }
    });
    row = rowCounts.indexOf(Math.min(...rowCounts)) * direction;
  }

  return row;
};

const determineStatus = (actualAge: number, expectedAge: number): 'typical' | 'monitor' | 'delayed' => {
  const difference = actualAge - expectedAge;
  if (difference <= 2) {
    return 'typical';
  } else if (difference <= 6) {
    return 'monitor';
  } else {
    return 'delayed';
  }
};

const initialMilestones: Milestone[] = [
  // Communication milestones
  { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
  { id: 'two-word-phrases', title: 'Two-word phrases', category: 'communication', expectedAge: 24 },
  { id: 'complex-sentences', title: 'Complex sentences', category: 'communication', expectedAge: 36 },
  { id: 'follows-commands', title: 'Follows commands', category: 'communication', expectedAge: 18 },
  { id: 'uses-gestures', title: 'Uses gestures', category: 'communication', expectedAge: 9 },

  // Motor milestones
  { id: 'rolling-over', title: 'Rolling over', category: 'motor', expectedAge: 6 },
  { id: 'sitting', title: 'Sitting', category: 'motor', expectedAge: 8 },
  { id: 'crawling', title: 'Crawling', category: 'motor', expectedAge: 10 },
  { id: 'walking', title: 'Walking', category: 'motor', expectedAge: 12 },
  { id: 'running', title: 'Running', category: 'motor', expectedAge: 18 },

  // Social milestones
  { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
  { id: 'stranger-anxiety', title: 'Stranger anxiety', category: 'social', expectedAge: 8 },
  { id: 'parallel-play', title: 'Parallel play', category: 'social', expectedAge: 24 },
  { id: 'cooperative-play', title: 'Cooperative play', category: 'social', expectedAge: 36 },
  { id: 'shows-empathy', title: 'Shows empathy', category: 'social', expectedAge: 48 },

  // Developmental concerns milestones
  { 
    id: 'sensory-responses', 
    title: 'Sensory responses', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'restricted-interests', 
    title: 'Restricted interests', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'social-reciprocity', 
    title: 'Social reciprocity', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'custom-concern', 
    title: '+', 
    category: 'concerns', 
    expectedAge: 0
  }
];

export const MilestoneTracker: React.FC<{ onChange?: (data: any) => void }> = ({ onChange }) => {
  const { globalState, updateAssessment } = useFormState();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const maxAge = 72;
  const [customConcernCount, setCustomConcernCount] = useState(0);

  const milestones = globalState.assessments?.milestones?.milestones || initialMilestones;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const month = parseInt(over.id.toString().replace('month-', ''));
    
    const draggedMilestone = milestones.find((m: Milestone) => m.id === active.id);
    if (!draggedMilestone) return;

    const status = determineStatus(month, draggedMilestone.expectedAge);
    
    const updatedMilestones = milestones.map((m: Milestone) => 
      m.id === active.id ? {
        ...m,
        actualAge: month,
        stackPosition: getStackPosition(milestones, month, active.id.toString()),
        status
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

  const handleCustomConcern = useCallback((text: string) => {
    const newMilestone: Milestone = {
      id: `custom-concern-${customConcernCount + 1}`,
      title: text,
      category: 'concerns',
      expectedAge: 0
    };

    const updatedMilestones = [...milestones, newMilestone];
    updateAssessment('milestones', {
      type: 'milestoneTracker',
      milestones: updatedMilestones
    });

    setCustomConcernCount(prev => prev + 1);

    if (onChange) {
      onChange({
        type: 'milestoneTracker',
        milestones: updatedMilestones
      });
    }
  }, [milestones, customConcernCount, updateAssessment, onChange]);

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
                      onCustomConcern={handleCustomConcern}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timeline}>
            {Array.from({ length: maxAge + 1 }, (_, i) => (
              <TimelineMonth key={i} month={i} maxAge={maxAge} />
            ))}

            {/* Expected age indicator */}
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

            {/* Current position indicator while dragging */}
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
                        top: `${(milestone.stackPosition || 0) * 25}px`,
                        transform: 'translate(-50%, 0)'
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