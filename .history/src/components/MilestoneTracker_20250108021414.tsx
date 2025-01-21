import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';

interface Milestone {
  id: string;
  name: string;
  category: CategoryType;
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

type CategoryType = 'motor' | 'language' | 'social' | 'cognitive' | 'concerns';

type CategoryInfoMap = Record<CategoryType, CategoryInfo>;

const initialMilestones: Milestone[] = [
  // Motor milestones
  { id: 'motor1', name: 'Head Control', category: 'motor', expectedAge: 3 },
  { id: 'motor2', name: 'Rolling Over', category: 'motor', expectedAge: 6 },
  { id: 'motor3', name: 'Sitting Independently', category: 'motor', expectedAge: 8 },
  { id: 'motor4', name: 'Crawling', category: 'motor', expectedAge: 9 },
  { id: 'motor5', name: 'Walking', category: 'motor', expectedAge: 12 },

  // Language milestones
  { id: 'language1', name: 'First Words', category: 'language', expectedAge: 12 },
  { id: 'language2', name: 'Two-Word Phrases', category: 'language', expectedAge: 24 },
  { id: 'language3', name: 'Follows Commands', category: 'language', expectedAge: 18 },
  { id: 'language4', name: 'Complex Sentences', category: 'language', expectedAge: 36 },
  { id: 'language5', name: 'Conversations', category: 'language', expectedAge: 30 },

  // Social milestones
  { id: 'social1', name: 'Social Smile', category: 'social', expectedAge: 2 },
  { id: 'social2', name: 'Joint Attention', category: 'social', expectedAge: 9 },
  { id: 'social3', name: 'Peek-a-boo', category: 'social', expectedAge: 6 },
  { id: 'social4', name: 'Pretend Play', category: 'social', expectedAge: 18 },
  { id: 'social5', name: 'Interactive Play', category: 'social', expectedAge: 24 },

  // Cognitive milestones
  { id: 'cognitive1', name: 'Object Permanence', category: 'cognitive', expectedAge: 8 },
  { id: 'cognitive2', name: 'Cause & Effect', category: 'cognitive', expectedAge: 12 },
  { id: 'cognitive3', name: 'Problem Solving', category: 'cognitive', expectedAge: 18 },
  { id: 'cognitive4', name: 'Sorting', category: 'cognitive', expectedAge: 24 },
  { id: 'cognitive5', name: 'Imaginative Play', category: 'cognitive', expectedAge: 30 },

  // Developmental concerns
  { id: 'concerns1', name: 'Regression', category: 'concerns', expectedAge: 0 },
  { id: 'concerns2', name: 'Atypical Patterns', category: 'concerns', expectedAge: 0 },
  { id: 'concerns3', name: 'Delayed Milestones', category: 'concerns', expectedAge: 0 },
  { id: 'concerns4', name: 'Social Challenges', category: 'concerns', expectedAge: 0 },
  { id: 'concerns5', name: 'Communication Delays', category: 'concerns', expectedAge: 0 }
];

const categoryInfo: CategoryInfoMap = {
  motor: {
    title: 'Motor Skills',
    color: '#48BB78',
    tooltips: {
      'Head Control': 'Holds head steady without support',
      'Rolling Over': 'Can roll from back to tummy and back',
      'Sitting Independently': 'Sits without support for extended period',
      'Crawling': 'Moves on hands and knees',
      'Walking': 'Takes independent steps'
    }
  },
  language: {
    title: 'Communication',
    color: '#4299E1',
    tooltips: {
      'First Words': 'Uses specific words consistently with meaning',
      'Two-Word Phrases': 'Combines words meaningfully',
      'Follows Commands': 'Follows simple one-step directions',
      'Complex Sentences': 'Uses 3+ word sentences',
      'Conversations': 'Engages in back-and-forth exchanges'
    }
  },
  social: {
    title: 'Social Skills',
    color: '#ED8936',
    tooltips: {
      'Social Smile': 'Smiles in response to faces and voices',
      'Joint Attention': 'Shares attention with others on objects/events',
      'Peek-a-boo': 'Engages in social games',
      'Pretend Play': 'Uses objects in pretend play',
      'Interactive Play': 'Plays cooperatively with peers'
    }
  },
  cognitive: {
    title: 'Cognitive',
    color: '#9F7AEA',
    tooltips: {
      'Object Permanence': 'Understands objects exist when hidden',
      'Cause & Effect': 'Shows understanding of simple cause/effect',
      'Problem Solving': 'Attempts to solve simple problems',
      'Sorting': 'Groups similar objects together',
      'Imaginative Play': 'Creates simple pretend scenarios'
    }
  },
  concerns: {
    title: 'Developmental Concerns',
    color: '#E53E3E',
    tooltips: {
      'Regression': 'Loss of previously acquired skills',
      'Atypical Patterns': 'Unusual developmental patterns',
      'Delayed Milestones': 'Multiple milestones not met on time',
      'Social Challenges': 'Difficulties with social interaction',
      'Communication Delays': 'Significant delays in communication'
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

const DraggableMilestone: React.FC<{ 
  milestone: Milestone;
  category: CategoryType;
}> = ({ milestone, category }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const tooltipText = categoryInfo[category].tooltips[milestone.name];

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={styles.milestone}
      data-category={category}
      data-tooltip={tooltipText}
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {milestone.name}
    </motion.div>
  );
};

interface MilestoneData {
  id: string;
  name: string;
  expectedAge: number;
  category: string;
  actualAge?: number;
}

export const MilestoneTracker: React.FC = () => {
  const { globalState, updateAssessment } = useFormState();
  const [placedMilestones, setPlacedMilestones] = useState<Milestone[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize milestones if they don't exist
    if (!globalState?.assessments?.milestones?.milestones) {
      updateAssessment('milestones', {
        type: 'milestoneTracker',
        milestones: initialMilestones,
        progress: 0
      });
    } else {
      const storedMilestones = globalState.assessments.milestones.milestones
        .filter((m: MilestoneData): m is Milestone => {
          if (!m.actualAge) return false;
          const category = m.category as CategoryType;
          return category === 'motor' || 
                 category === 'language' || 
                 category === 'social' || 
                 category === 'cognitive' || 
                 category === 'concerns';
        });
      setPlacedMilestones(storedMilestones);
    }
  }, [globalState?.assessments?.milestones?.milestones, updateAssessment]);

  const calculateProgress = useCallback((milestones: MilestoneData[]) => {
    const totalMilestones = milestones.filter(m => m.category !== 'concerns').length;
    const placedMilestones = milestones.filter(m => m.actualAge !== undefined && m.category !== 'concerns').length;
    return Math.round((placedMilestones / totalMilestones) * 100);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const milestone = globalState.assessments.milestones.milestones
      .find((m: MilestoneData): m is Milestone => {
        if (m.id !== active.id) return false;
        const category = m.category as CategoryType;
        return category === 'motor' || 
               category === 'language' || 
               category === 'social' || 
               category === 'cognitive' || 
               category === 'concerns';
      });
    
    if (!milestone) return;

    const monthMatch = over.id.toString().match(/month-(\d+)/);
    if (!monthMatch) return;

    const actualAge = parseInt(monthMatch[1]);
    const updatedMilestone = { ...milestone, actualAge };

    // Update the milestone in the form state
    const updatedMilestones = globalState.assessments.milestones.milestones.map(
      (m: MilestoneData) => (m.id === milestone.id ? updatedMilestone : m)
    );

    const progress = calculateProgress(updatedMilestones);

    updateAssessment('milestones', {
      milestones: updatedMilestones,
      progress
    });

    setPlacedMilestones(prev => {
      const filtered = prev.filter(m => m.id !== milestone.id);
      return [...filtered, updatedMilestone];
    });
  };

  const removeMilestone = (id: string) => {
    const updatedMilestones = globalState.assessments.milestones.milestones.map(
      (m: MilestoneData) => (m.id === id ? { ...m, actualAge: undefined } : m)
    );

    const progress = calculateProgress(updatedMilestones);

    updateAssessment('milestones', {
      milestones: updatedMilestones,
      progress
    });

    setPlacedMilestones(prev => prev.filter(m => m.id !== id));
  };

  const maxAge = 36; // 3 years in months
  const monthMarkers = Array.from({ length: maxAge + 1 }, (_, i) => i);

  return (
    <div className={styles.container}>
      <DndContext onDragEnd={handleDragEnd}>
        <div className={styles.categoriesContainer}>
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className={styles.category}>
              <h3 style={{ color: info.color }}>{info.title}</h3>
              <div className={styles.milestoneList}>
                {(globalState?.assessments?.milestones?.milestones || initialMilestones)
                  .filter((m: MilestoneData): m is Milestone => {
                    if (m.actualAge !== undefined) return false;
                    const mCategory = m.category as CategoryType;
                    return mCategory === category;
                  })
                  .map((milestone) => (
                    <DraggableMilestone
                      key={milestone.id}
                      milestone={milestone}
                      category={milestone.category}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.timelineContainer}>
          <div ref={timelineRef} className={styles.timeline}>
            {monthMarkers.map(month => (
              <TimelineMonth key={month} month={month} maxAge={maxAge} />
            ))}
            <div className={styles.placedMilestones}>
              {placedMilestones.map(milestone => (
                <div
                  key={milestone.id}
                  className={styles.timelineMilestone}
                  style={{
                    left: `${(milestone.actualAge! / maxAge) * 100}%`,
                    color: categoryInfo[milestone.category].color
                  }}
                >
                  <motion.div
                    className={`${styles.milestone} ${styles.placedMilestone}`}
                    data-category={milestone.category}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {milestone.name}
                    <button
                      className={styles.removeButton}
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      ×
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}; 