import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import styles from './MilestoneTracker.module.css';

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
}

const categoryInfo: { [key: string]: CategoryInfo } = {
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

const DraggableMilestone: React.FC<{ 
  milestone: Milestone; 
  category: string;
  tooltipText: string;
}> = ({ milestone, category, tooltipText }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone, category }
  });

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={styles.milestone}
      data-category={category}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span>{milestone.title}</span>
      {showTooltip && (
        <div className={styles.tooltip}>
          {tooltipText}
        </div>
      )}
    </motion.div>
  );
};

const TimelineIndicators: React.FC<{ milestones: Milestone[] }> = ({ milestones }) => {
  return (
    <>
      {milestones.map(milestone => (
        <React.Fragment key={milestone.id}>
          {/* Expected age indicator */}
          <div 
            className={styles.expectedAgeIndicator}
            style={{ left: `${(milestone.expectedAge / 72) * 100}%` }}
          >
            <div className={styles.indicatorLabel}>
              Expected: {milestone.expectedAge}m
            </div>
          </div>
          
          {/* Actual age indicator */}
          {milestone.actualAge !== null && (
            <div 
              className={styles.actualAgeIndicator}
              style={{ 
                left: `${(milestone.actualAge / 72) * 100}%`,
                borderColor: categoryInfo[milestone.category].color
              }}
            >
              <div className={styles.indicatorLabel}>
                Achieved: {milestone.actualAge}m
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

const TimelineMonth: React.FC<{ month: number; maxAge: number }> = ({ month, maxAge }) => {
  const { setNodeRef } = useDroppable({
    id: `month-${month}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={styles.monthMarker}
      style={{ left: `${(month / maxAge) * 100}%` }}
    >
      <div className={`${styles.markerLine} ${month % 12 === 0 ? styles.yearMarker : ''}`} />
      {month % 12 === 0 && (
        <span className={styles.markerLabel}>
          {Math.floor(month/12)}y
        </span>
      )}
      {month % 6 === 0 && month % 12 !== 0 && (
        <span className={styles.markerLabel}>
          {month}m
        </span>
      )}
    </div>
  );
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState(initialMilestones);
  const maxAge = 72; // 6 years in months

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const month = parseInt(over.id.replace('month-', ''));
    
    setMilestones(prev => prev.map(m => {
      if (m.id === active.id) {
        return { ...m, actualAge: month };
      }
      return m;
    }));
  };

  return (
    <div className={styles.container}>
      <DndContext onDragEnd={handleDragEnd}>
        {/* Categories and unplaced milestones */}
        <div className={styles.categoriesContainer}>
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className={styles.category}>
              <h3>{info.title}</h3>
              <div className={styles.milestoneList}>
                {milestones
                  .filter(m => m.category === category && !m.actualAge)
                  .map(milestone => (
                    <DraggableMilestone
                      key={milestone.id}
                      milestone={milestone}
                      category={category}
                      tooltipText={info.tooltips[milestone.title]}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {/* Month markers */}
          {Array.from({ length: maxAge + 1 }, (_, i) => (
            <TimelineMonth key={i} month={i} maxAge={maxAge} />
          ))}

          {/* Timeline indicators */}
          <div className={styles.timelineIndicators}>
            <TimelineIndicators milestones={milestones} />
          </div>

          {/* Placed milestones */}
          <div className={styles.placedMilestones}>
            <AnimatePresence>
              {milestones
                .filter(m => m.actualAge !== undefined)
                .map(milestone => (
                  <motion.div
                    key={milestone.id}
                    className={styles.timelineMilestone}
                    style={{
                      left: `${((milestone.actualAge || 0) / maxAge) * 100}%`,
                      backgroundColor: `${categoryInfo[milestone.category].color}22`,
                      borderLeftColor: categoryInfo[milestone.category].color
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <DraggableMilestone
                      milestone={milestone}
                      category={milestone.category}
                      tooltipText={categoryInfo[milestone.category].tooltips[milestone.title]}
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