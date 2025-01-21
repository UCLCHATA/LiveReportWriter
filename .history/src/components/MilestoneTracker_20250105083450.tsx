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
      'Sensory reactions': 'Unusual responses to sounds, textures, lights (e.g., covers ears, avoids touch)',
      'Play patterns': 'Lines up toys, fixates on parts, same play routine',
      'Social engagement': 'Prefers alone, doesn\'t share interests or show things'
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Only set up draggable if it's not the custom-concern button
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone },
    disabled: milestone.id === 'custom-concern'
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}`
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
  { id: 'babbling', title: 'Babbling', category: 'communication', expectedAge: 6 },
  { id: 'name-response', title: 'Name response', category: 'communication', expectedAge: 9 },
  { id: 'points-to-show', title: 'Points to show', category: 'communication', expectedAge: 12 },
  { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
  { id: 'combines-words', title: 'Combines words', category: 'communication', expectedAge: 24 },

  // Motor milestones
  { id: 'head-control', title: 'Head control', category: 'motor', expectedAge: 3 },
  { id: 'reaches-grasps', title: 'Reaches & grasps', category: 'motor', expectedAge: 5 },
  { id: 'independent-sitting', title: 'Independent sitting', category: 'motor', expectedAge: 8 },
  { id: 'independent-walking', title: 'Independent walking', category: 'motor', expectedAge: 12 },
  { id: 'climbs-runs', title: 'Climbs & runs', category: 'motor', expectedAge: 18 },

  // Social milestones
  { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
  { id: 'eye-contact', title: 'Eye contact', category: 'social', expectedAge: 3 },
  { id: 'imitation', title: 'Imitation', category: 'social', expectedAge: 9 },
  { id: 'pretend-play', title: 'Pretend play', category: 'social', expectedAge: 18 },
  { id: 'interactive-play', title: 'Interactive play', category: 'social', expectedAge: 24 },

  // Developmental concerns
  { 
    id: 'sensory-reactions', 
    title: 'Sensory reactions', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'play-patterns', 
    title: 'Play patterns', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'social-engagement', 
    title: 'Social engagement', 
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

interface HistoryTextBoxProps {
  value: string;
  onChange: (value: string) => void;
}

const HistoryTextBox: React.FC<HistoryTextBoxProps> = ({ value, onChange }) => {
  const placeholderText = `Document history of concerns, including:
• Age when parents first noticed differences
• Early signs (e.g., limited eye contact, delayed babbling)
• Response to name and social engagement
• Changes in development patterns
• Environmental factors and adaptations
• Impact on daily activities and routines
• Family history of developmental conditions`;

  return (
    <div className={styles.historyBox}>
      <h3>History of Concerns</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderText}
        className={styles.historyTextarea}
      />
    </div>
  );
};

// Add expectation line component
const ExpectationLine: React.FC<{
  actualAge: number;
  expectedAge: number;
  maxAge: number;
  isEarly: boolean;
  category: CategoryType;
}> = ({ actualAge, expectedAge, maxAge, isEarly, category }) => {
  // Calculate positions as percentages
  const actualX = (actualAge / maxAge) * 100;
  const expectedX = (expectedAge / maxAge) * 100;
  
  // Calculate width based on the distance between actual and expected
  const width = Math.abs(expectedX - actualX);
  
  // For early placement, line starts at actual and goes right to expected
  // For delayed placement, line starts at expected and goes right to actual
  const startX = isEarly ? actualX : expectedX;
  
  return (
    <div 
      className={styles.expectationLine}
      style={{
        left: `${startX}%`,
        width: `${width}%`,
        transform: isEarly ? 'none' : 'scaleX(-1)'
      }}
    />
  );
};

export const MilestoneTracker: React.FC<{ onChange?: (data: any) => void }> = ({ onChange }) => {
  const { globalState, updateAssessment } = useFormState();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const maxAge = 72;
  const [customConcernCount, setCustomConcernCount] = useState(0);
  const [historyText, setHistoryText] = useState(globalState.assessments?.milestones?.history || '');

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

  const handleHistoryChange = useCallback((text: string) => {
    setHistoryText(text); // Update local state
    updateAssessment('milestones', {
      type: 'milestoneTracker',
      milestones,
      history: text
    });

    if (onChange) {
      onChange({
        type: 'milestoneTracker',
        milestones,
        history: text
      });
    }
  }, [milestones, updateAssessment, onChange]);

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
                  .map((milestone: Milestone) => {
                    const isEarly = milestone.actualAge !== undefined && 
                                   milestone.expectedAge !== 0 && 
                                   milestone.actualAge < milestone.expectedAge;
                    
                    return (
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
                        {milestone.expectedAge !== 0 && (
                          <ExpectationLine
                            actualAge={milestone.actualAge || 0}
                            expectedAge={milestone.expectedAge}
                            maxAge={maxAge}
                            isEarly={isEarly}
                            category={milestone.category}
                          />
                        )}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DndContext>
      
      <HistoryTextBox 
        value={historyText}
        onChange={handleHistoryChange}
      />
    </div>
  );
};

export default MilestoneTracker; 