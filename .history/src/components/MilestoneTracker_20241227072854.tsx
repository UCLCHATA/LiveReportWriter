import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { HelpCircle } from 'lucide-react';
import styles from './MilestoneTracker.module.css';

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
    description: 'Language development including receptive and expressive skills',
    color: '#4f46e5'
  },
  motor: {
    title: 'Motor Skills',
    description: 'Gross and fine motor development including balance and coordination',
    color: '#10b981'
  },
  social: {
    title: 'Social & Emotional',
    description: 'Social interaction, emotional regulation, and relationship development',
    color: '#f59e0b'
  }
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [draggingMilestone, setDraggingMilestone] = useState<Milestone | null>(null);
  const maxAge = Math.max(...milestones.map(m => m.expectedAge));

  const handleDragStart = (start: any) => {
    const milestone = milestones.find(m => m.id === start.draggableId);
    if (milestone) {
      setDraggingMilestone(milestone);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggingMilestone(null);
    if (!result.destination || result.destination.droppableId !== 'timeline') return;

    // Convert the drop index to an age (each index represents 1 month)
    const droppedAge = Math.min(maxAge, result.destination.index);

    setMilestones(prev => prev.map(milestone => 
      milestone.id === result.draggableId
        ? { ...milestone, actualAge: droppedAge }
        : milestone
    ));
  };

  // Create droppable slots for each month
  const timelineSlots = Array.from({ length: maxAge + 1 }, (_, i) => ({
    id: `month-${i}`,
    age: i
  }));

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <div className={styles.categoriesContainer}>
          {Object.entries(categoryInfo).map(([category, info]) => (
            <div key={category} className={styles.categoryColumn}>
              <div className={styles.categoryHeader}>
                <h3>{info.title}</h3>
                <div className={styles.tooltipWrapper}>
                  <HelpCircle size={14} className={styles.helpIcon} />
                  <div className={styles.tooltipContent}>{info.description}</div>
                </div>
              </div>
              <Droppable droppableId={`droppable-${category}`} isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.milestoneList}
                  >
                    {milestones
                      .filter(m => m.category === category && !m.actualAge)
                      .map((milestone, index) => (
                        <Draggable
                          key={milestone.id}
                          draggableId={milestone.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${styles.milestone} ${snapshot.isDragging ? styles.dragging : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: info.color + '20',
                                borderColor: info.color
                              }}
                            >
                              <div className={styles.milestoneContent}>
                                <span>{milestone.title}</span>
                                <div className={styles.tooltipContent}>
                                  <p>{milestone.description}</p>
                                  <small>{milestone.clinicalNotes}</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        <Droppable droppableId="timeline" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${styles.timelineContainer} ${snapshot.isDraggingOver ? styles.timelineDragActive : ''}`}
            >
              <div className={styles.timeline}>
                {timelineSlots.map((slot, index) => (
                  <Draggable
                    key={slot.id}
                    draggableId={slot.id}
                    index={index}
                    isDragDisabled={true}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={styles.timelineSlot}
                        style={{
                          left: `${(slot.age / maxAge) * 100}%`,
                          ...provided.draggableProps.style
                        }}
                      />
                    )}
                  </Draggable>
                ))}
                {draggingMilestone && (
                  <div
                    className={styles.expectedMarker}
                    style={{
                      left: `${(draggingMilestone.expectedAge / maxAge) * 100}%`,
                      backgroundColor: categoryInfo[draggingMilestone.category].color + '40'
                    }}
                  />
                )}
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
                      title={`${milestone.title} - Actual: ${milestone.actualAge}m (Expected: ${milestone.expectedAge}m)`}
                    />
                  ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default MilestoneTracker; 