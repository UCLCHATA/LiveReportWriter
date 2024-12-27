import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragMoveEvent,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
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

const Draggable: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const DroppableTimeline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef } = useDroppable({
    id: 'timeline',
  });

  return (
    <div ref={setNodeRef} className={styles.timeline}>
      {children}
    </div>
  );
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const maxAge = 72; // 6 years in months

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedMilestone = milestones.find(m => m.id === event.active.id);
    setActiveMilestone(draggedMilestone || null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const timeline = document.querySelector(`.${styles.timeline}`);
    if (!timeline || !event.over) return;

    const rect = timeline.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const month = Math.round((x / rect.width) * maxAge);

    // Update position indicator
    const indicator = document.querySelector(`.${styles.currentAgeIndicator}`);
    if (indicator) {
      indicator.style.left = `${(month / maxAge) * 100}%`;
      indicator.textContent = month >= 12 ? 
        `${Math.floor(month/12)}y${month%12}m` : 
        `${month}m`;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const timeline = document.querySelector(`.${styles.timeline}`);
    if (!timeline || !event.over) return;

    const rect = timeline.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const month = Math.round((x / rect.width) * maxAge);

    setMilestones(prev => prev.map(m => {
      if (m.id === event.active.id) {
        return { ...m, actualAge: month };
      }
      return m;
    }));

    setActiveMilestone(null);
  };

  return (
    <div className={styles.container}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.categoriesContainer}>
          {/* Categories and draggable milestones */}
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className={styles.category}>
              <h3>{info.title}</h3>
              <div className={styles.milestoneList}>
                {milestones
                  .filter(m => m.category === category && !m.actualAge)
                  .map(milestone => (
                    <Draggable key={milestone.id} id={milestone.id}>
                      <div
                        className={styles.milestone}
                        data-category={milestone.category}
                        onMouseEnter={() => setHoveredMilestone(milestone.id)}
                        onMouseLeave={() => setHoveredMilestone(null)}
                      >
                        <span>{milestone.title}</span>
                        {hoveredMilestone === milestone.id && (
                          <div className={styles.tooltip}>
                            {info.tooltips[milestone.title]}
                          </div>
                        )}
                      </div>
                    </Draggable>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <DroppableTimeline>
          {/* Month markers */}
          {Array.from({ length: maxAge / 3 + 1 }, (_, i) => i * 3).map(month => (
            <div
              key={month}
              className={styles.monthMarker}
              style={{ left: `${(month / maxAge) * 100}%` }}
            >
              <div className={styles.markerLine} />
              <span className={styles.markerLabel}>
                {month >= 12 ? `${Math.floor(month/12)}y${month%12}m` : `${month}m`}
              </span>
            </div>
          ))}

          {/* Placed milestones */}
          {milestones
            .filter(m => m.actualAge !== undefined)
            .map(milestone => (
              <Draggable key={milestone.id} id={milestone.id}>
                <div
                  className={styles.timelineMilestone}
                  style={{
                    left: `${((milestone.actualAge || 0) / maxAge) * 100}%`,
                    backgroundColor: `${categoryInfo[milestone.category].color}22`,
                    borderLeftColor: categoryInfo[milestone.category].color
                  }}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                >
                  <span>{milestone.title}</span>
                  {hoveredMilestone === milestone.id && (
                    <div className={styles.tooltip}>
                      {`${milestone.title} - Actual: ${milestone.actualAge}m (Expected: ${milestone.expectedAge}m)`}
                    </div>
                  )}
                </div>
              </Draggable>
            ))}
        </DroppableTimeline>

        <DragOverlay>
          {activeMilestone && (
            <div
              className={styles.milestone}
              style={{
                backgroundColor: `${categoryInfo[activeMilestone.category].color}22`,
                borderLeftColor: categoryInfo[activeMilestone.category].color
              }}
            >
              <span>{activeMilestone.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default MilestoneTracker; 