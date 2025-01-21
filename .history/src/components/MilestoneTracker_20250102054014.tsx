import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';

interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
}

interface CategoryInfo {
  title: string;
  color: string;
  tooltips: { [key: string]: string };
}

type CategoryType = 'communication' | 'motor' | 'social';

interface CategoryInfoMap {
  communication: CategoryInfo;
  motor: CategoryInfo;
  social: CategoryInfo;
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
  onDelete?: () => void;
}> = ({ milestone, category, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete clicked for milestone:', milestone.id);
    if (onDelete) {
      onDelete();
    }
  };

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m\nExpected: ${milestone.expectedAge}m` 
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      style={style}
      title={tooltipText}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {milestone.title}
      {milestone.actualAge !== undefined && (
        <div 
          className={styles.monthCircle}
          onClick={handleDelete}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <span className={styles.monthText}>{milestone.actualAge}m</span>
          <span className={styles.deleteIcon}>×</span>
        </div>
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
  const placedMilestones = milestones
    .filter(m => m.actualAge !== undefined && m.id !== currentId);

  let row = 0;
  let hasOverlap = true;

  while (hasOverlap) {
    hasOverlap = placedMilestones.some((m: Milestone) => {
      const distance = Math.abs((m.actualAge || 0) - currentMonth);
      const mightOverlap = distance <= 20; // Changed from 13 to 20
      
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
  { id: 'shows-empathy', title: 'Shows empathy', category: 'social', expectedAge: 48 }
];

export const MilestoneTracker: React.FC = () => {
  const { globalState, updateAssessment } = useFormState();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const maxAge = 72;

  const milestones = globalState.assessments?.milestones?.milestones || initialMilestones;

  const handleDeleteMilestone = useCallback((milestoneId: string) => {
    console.log('Deleting milestone:', milestoneId);
    
    // Find the milestone to delete and its original data
    const milestoneToDelete = milestones.find((m: Milestone) => m.id === milestoneId);
    const originalMilestone = initialMilestones.find((m: Milestone) => m.id === milestoneId);
    
    if (!milestoneToDelete || !originalMilestone) {
      console.error('Could not find milestone to delete:', milestoneId);
      return;
    }

    // Create new array with the milestone reset to its original state
    const updatedMilestones = milestones.map((m: Milestone) => 
      m.id === milestoneId ? { ...originalMilestone } : m
    );

    console.log('Milestone state update:', {
      before: milestoneToDelete,
      after: originalMilestone,
      totalMilestones: updatedMilestones.length,
      placedMilestones: updatedMilestones.filter(m => m.actualAge !== undefined).length
    });

    // Update the global state
    updateAssessment('milestones', {
      type: 'milestoneTracker',
      milestones: updatedMilestones
    });
  }, [milestones, updateAssessment]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const month = parseInt(over.id.toString().replace('month-', ''));
    
    // Find the milestone being dragged
    const draggedMilestone = milestones.find((m: Milestone) => m.id === active.id);
    if (!draggedMilestone) return;

    // Create new array with the milestone placed
    const updatedMilestones = milestones.map((m: Milestone) => 
      m.id === active.id ? {
        ...m,
        actualAge: month,
        stackPosition: getStackPosition(milestones, month, active.id.toString())
      } : m
    );

    console.log('Milestone placement:', {
      id: active.id,
      month,
      totalMilestones: updatedMilestones.length,
      placedMilestones: updatedMilestones.filter(m => m.actualAge !== undefined).length
    });

    // Update the global state
    updateAssessment('milestones', {
      type: 'milestoneTracker',
      milestones: updatedMilestones
    });

    setActiveMilestone(null);
    setCurrentMonth(null);
  }, [milestones, updateAssessment]);

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

        <div className={styles.timeline}>
          {/* Month markers - render all months for dropping but only show markers at intervals */}
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

          {/* Placed milestones */}
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
                      onDelete={() => handleDeleteMilestone(milestone.id)}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default MilestoneTracker; 