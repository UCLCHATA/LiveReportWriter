import React, { useState, useRef, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import { Milestone, categoryInfo } from '../types';
import styles from './MilestoneTracker.module.css';
import { getStackPosition } from '../utils/milestoneUtils';
import { initialMilestones } from '../data/initialMilestones';

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

interface CategoryInfo {
  title: string;
  color: string;
  tooltips: { [key: string]: string };
}

interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social';
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
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
  category: string;
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
  category: string;
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
    if (onDelete) {
      console.log('Deleting milestone:', milestone.id);
      onDelete();
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`}
      data-category={category}
      data-milestone-id={milestone.id}
      style={style}
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

export const MilestoneTracker: React.FC = () => {
  const { globalState, updateAssessment } = useFormState();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const maxAge = 72;

  const milestones = globalState.assessments?.milestones?.milestones || initialMilestones;
  const prevMilestonesRef = useRef(milestones);

  // Calculate progress whenever milestones change
  React.useEffect(() => {
    if (!milestones || milestones === prevMilestonesRef.current) return;
    
    prevMilestonesRef.current = milestones;
    const placedMilestones = milestones.filter((m: Milestone) => m.actualAge !== undefined);
    const progress = Math.min((placedMilestones.length / milestones.length) * 100, 10); // Cap at 10%
    
    // Only update if progress has changed
    if (globalState.assessments?.progress?.milestoneTracker !== progress) {
      updateAssessment('progress', {
        type: 'milestoneTracker',
        value: progress
      });
    }
  }, [milestones, globalState.assessments?.progress?.milestoneTracker]);

  const handleDeleteMilestone = useCallback((milestoneId: string) => {
    const updatedMilestones = milestones.map((m: Milestone) => 
      m.id === milestoneId 
        ? { ...m, actualAge: undefined, stackPosition: undefined }
        : m
    );
    
    updateAssessment('milestones', { 
      type: 'milestoneTracker',
      milestones: updatedMilestones 
    });
  }, [milestones, updateAssessment]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const month = parseInt(over.id.toString().replace('month-', ''));
    
    const updatedMilestones = [...milestones];
    const draggedIndex = updatedMilestones.findIndex((m: Milestone) => m.id === active.id);
    
    if (draggedIndex !== -1) {
      const stackPosition = getStackPosition(updatedMilestones, month, active.id.toString());
      updatedMilestones[draggedIndex] = {
        ...updatedMilestones[draggedIndex],
        actualAge: month,
        stackPosition: stackPosition
      };
      
      updateAssessment('milestones', { 
        type: 'milestoneTracker',
        milestones: updatedMilestones 
      });
    }

    setActiveMilestone(null);
    setCurrentMonth(null);
  }, [milestones, updateAssessment]);

  const handleDragStart = (event: DragEndEvent) => {
    const draggedMilestone = milestones.find((m: Milestone) => m.id === event.active.id);
    setActiveMilestone(draggedMilestone || null);
  };

  const handleDragMove = (event: DragEndEvent) => {
    if (!event.over) return;
    const month = parseInt(event.over.id.toString().replace('month-', ''));
    
    const timeline = document.querySelector(`.${styles.timeline}`);
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const y = rect.height - Math.min(Math.max((event as any).clientY - rect.top, 0), rect.height);
      setCurrentMonth(month);
      setVerticalPosition(y / rect.height);
    }
  };

  return (
    <div className={styles.container}>
      <DndContext 
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.categoriesContainer}>
          {Object.entries(categoryInfo).map(([category, info]) => (
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