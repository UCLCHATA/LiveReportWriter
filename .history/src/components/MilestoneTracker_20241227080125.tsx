import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragMoveEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './MilestoneTracker.module.css';
import { Draggable } from './dnd/Draggable';
import { Droppable } from './dnd/Droppable';

interface Milestone {
  id: string;
  title: string;
  expectedAge: number;
  actualAge?: number;
  category: 'communication' | 'motor' | 'social';
  description: string;
  clinicalNotes?: string;
}

const initialMilestones: Milestone[] = [
  // Communication milestones
  { 
    id: 'c1', 
    title: 'First words', 
    expectedAge: 12, 
    category: 'communication',
    description: 'Uses 1-3 meaningful words consistently',
    clinicalNotes: 'Look for intentional use of words like "mama", "dada", "no"'
  },
  { 
    id: 'c2', 
    title: 'Two-word phrases', 
    expectedAge: 24, 
    category: 'communication',
    description: 'Combines two words to make simple phrases',
    clinicalNotes: 'Examples: "more milk", "car go", "daddy up"'
  },
  { 
    id: 'c3', 
    title: 'Complex sentences', 
    expectedAge: 36, 
    category: 'communication',
    description: 'Uses 3-4 word sentences with grammar',
    clinicalNotes: 'Should use pronouns, plurals, and basic prepositions'
  },
  { 
    id: 'c4', 
    title: 'Follows commands', 
    expectedAge: 18, 
    category: 'communication',
    description: 'Follows simple one-step directions',
    clinicalNotes: 'Check for understanding of basic instructions without gestures'
  },
  { 
    id: 'c5', 
    title: 'Uses gestures', 
    expectedAge: 9, 
    category: 'communication',
    description: 'Uses gestures to communicate needs',
    clinicalNotes: 'Look for pointing, waving, reaching with intent'
  },

  // Motor milestones
  { 
    id: 'm1', 
    title: 'Rolling over', 
    expectedAge: 6, 
    category: 'motor',
    description: 'Rolls from back to stomach and back',
    clinicalNotes: 'Should be able to roll both ways with head control'
  },
  { 
    id: 'm2', 
    title: 'Sitting', 
    expectedAge: 8, 
    category: 'motor',
    description: 'Sits without support for extended period',
    clinicalNotes: 'Check trunk stability and protective reactions'
  },
  { 
    id: 'm3', 
    title: 'Crawling', 
    expectedAge: 9, 
    category: 'motor',
    description: 'Moves on hands and knees in coordinated manner',
    clinicalNotes: 'Observe reciprocal pattern and core strength'
  },
  { 
    id: 'm4', 
    title: 'Walking', 
    expectedAge: 12, 
    category: 'motor',
    description: 'Walks independently with good balance',
    clinicalNotes: 'Note gait pattern and stability'
  },
  { 
    id: 'm5', 
    title: 'Running', 
    expectedAge: 18, 
    category: 'motor',
    description: 'Runs with coordination and speed control',
    clinicalNotes: 'Check for smooth transitions and balance'
  },

  // Social milestones
  { 
    id: 's1', 
    title: 'Social smile', 
    expectedAge: 2, 
    category: 'social',
    description: 'Smiles in response to social interaction',
    clinicalNotes: 'Should be intentional and responsive to caregivers'
  },
  { 
    id: 's2', 
    title: 'Stranger anxiety', 
    expectedAge: 8, 
    category: 'social',
    description: 'Shows wariness of unfamiliar people',
    clinicalNotes: 'Indicates secure attachment to primary caregivers'
  },
  { 
    id: 's3', 
    title: 'Parallel play', 
    expectedAge: 24, 
    category: 'social',
    description: 'Plays alongside other children',
    clinicalNotes: 'Observe awareness of peers without direct interaction'
  },
  { 
    id: 's4', 
    title: 'Cooperative play', 
    expectedAge: 36, 
    category: 'social',
    description: 'Engages in interactive play with peers',
    clinicalNotes: 'Look for turn-taking and shared pretend play'
  },
  { 
    id: 's5', 
    title: 'Shows empathy', 
    expectedAge: 48, 
    category: 'social',
    description: 'Demonstrates concern for others\' feelings',
    clinicalNotes: 'Note emotional recognition and appropriate responses'
  },
];

const categoryInfo = {
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

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const maxAge = 48; // Maximum age in months

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
    if (!event.over) return;
    
    if (event.over.id === 'timeline') {
      const timelineRect = document.querySelector(`.${styles.timeline}`)?.getBoundingClientRect();
      if (!timelineRect) return;

      const position = event.delta.x;
      const timelineWidth = timelineRect.width;
      const age = Math.max(0, Math.min(maxAge, (position / timelineWidth) * maxAge));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'timeline') {
      const timelineRect = document.querySelector(`.${styles.timeline}`)?.getBoundingClientRect();
      if (!timelineRect) return;

      const dropPoint = event.delta.x;
      const timelineWidth = timelineRect.width;
      const age = Math.max(0, Math.min(maxAge, (dropPoint / timelineWidth) * maxAge));

      setMilestones(prev => prev.map(m => {
        if (m.id === active.id) {
          return { ...m, actualAge: Math.round(age) };
        }
        return m;
      }));
    }

    setActiveMilestone(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.milestoneTrackerContainer}>
        <div className={styles.categoriesContainer}>
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className={styles.category}>
              <h3>{info.title}</h3>
              <div className={styles.milestoneList}>
                {milestones
                  .filter(m => m.category === category && m.actualAge === undefined)
                  .map(milestone => (
                    <Draggable key={milestone.id} id={milestone.id}>
                      <div 
                        className={styles.milestone}
                        onMouseEnter={() => setHoveredMilestone(milestone.id)}
                        onMouseLeave={() => setHoveredMilestone(null)}
                      >
                        <span>{milestone.title}</span>
                        {hoveredMilestone === milestone.id && (
                          <div className={styles.tooltip}>
                            {categoryInfo[milestone.category].tooltips[milestone.title]}
                          </div>
                        )}
                      </div>
                    </Draggable>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <Droppable id="timeline">
          <div className={styles.timeline}>
            {/* Month markers */}
            {Array.from({ length: Math.floor(maxAge / 6) + 1 }, (_, i) => i * 6).map(month => (
              <div
                key={month}
                className={styles.monthMarker}
                style={{ left: `${(month / maxAge) * 100}%` }}
              >
                <div className={styles.markerLine} />
                <span className={styles.markerLabel}>{month}m</span>
              </div>
            ))}

            {/* Placed milestones */}
            {milestones
              .filter(m => m.actualAge !== undefined)
              .map(milestone => (
                <div
                  key={milestone.id}
                  className={styles.timelineMilestone}
                  style={{
                    left: `${((milestone.actualAge || 0) / maxAge) * 100}%`,
                    backgroundColor: categoryInfo[milestone.category].color
                  }}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                >
                  {hoveredMilestone === milestone.id && (
                    <div className={styles.tooltip}>
                      {`${milestone.title} - Actual: ${milestone.actualAge}m (Expected: ${milestone.expectedAge}m)`}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Droppable>

        <DragOverlay>
          {activeMilestone && (
            <div 
              className={styles.milestone}
              style={{
                backgroundColor: categoryInfo[activeMilestone.category].color,
                opacity: 0.8
              }}
            >
              <span>{activeMilestone.title}</span>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default MilestoneTracker; 