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
}

const initialMilestones: Milestone[] = [
  // Communication milestones
  { id: 'c1', title: 'First words', expectedAge: 12, category: 'communication' },
  { id: 'c2', title: 'Two-word phrases', expectedAge: 24, category: 'communication' },
  { id: 'c3', title: 'Complex sentences', expectedAge: 36, category: 'communication' },
  { id: 'c4', title: 'Follows simple commands', expectedAge: 18, category: 'communication' },
  { id: 'c5', title: 'Uses gestures', expectedAge: 9, category: 'communication' },

  // Motor milestones
  { id: 'm1', title: 'Rolling over', expectedAge: 6, category: 'motor' },
  { id: 'm2', title: 'Sitting without support', expectedAge: 8, category: 'motor' },
  { id: 'm3', title: 'Crawling', expectedAge: 9, category: 'motor' },
  { id: 'm4', title: 'Walking independently', expectedAge: 12, category: 'motor' },
  { id: 'm5', title: 'Running', expectedAge: 18, category: 'motor' },

  // Social milestones
  { id: 's1', title: 'Social smile', expectedAge: 2, category: 'social' },
  { id: 's2', title: 'Stranger anxiety', expectedAge: 8, category: 'social' },
  { id: 's3', title: 'Parallel play', expectedAge: 24, category: 'social' },
  { id: 's4', title: 'Cooperative play', expectedAge: 36, category: 'social' },
  { id: 's5', title: 'Shows empathy', expectedAge: 48, category: 'social' },
];

const categoryInfo = {
  communication: {
    title: 'Communication',
    description: 'Language and communication milestones',
    color: '#4f46e5'
  },
  motor: {
    title: 'Motor Skills',
    description: 'Gross and fine motor development',
    color: '#10b981'
  },
  social: {
    title: 'Social & Emotional',
    description: 'Social interaction and emotional development',
    color: '#f59e0b'
  }
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const maxAge = Math.max(...milestones.map(m => m.expectedAge));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (start: any) => {
    setDraggingId(start.draggableId);
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggingId(null);
    if (!result.destination || result.destination.droppableId !== 'timeline') return;

    const timelineRect = document.getElementById('timeline')?.getBoundingClientRect();
    if (!timelineRect) return;

    // Get the drag event's client coordinates from the last sensor event
    const clientX = result.destination.clientX || 0;
    
    // Calculate the relative position within the timeline
    const relativeX = clientX - timelineRect.left;
    const timelineWidth = timelineRect.width;
    
    // Calculate the age based on the relative position
    const droppedAge = Math.max(0, Math.min(maxAge, Math.round((relativeX / timelineWidth) * maxAge)));

    setMilestones(prev => prev.map(milestone => 
      milestone.id === result.draggableId
        ? { ...milestone, actualAge: droppedAge }
        : milestone
    ));
  };

  const getMonthMarkers = () => {
    const markers: JSX.Element[] = [];
    for (let i = 0; i <= maxAge; i += 6) {
      markers.push(
        <div
          key={i}
          className={styles.monthMarker}
          style={{ left: `${(i / maxAge) * 100}%` }}
        >
          <div className={styles.markerLine} />
          <span className={styles.markerLabel}>{i}m</span>
        </div>
      );
    }
    return markers;
  };

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
              <Droppable droppableId={category} type="milestone">
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
                              <span>{milestone.title}</span>
                              <small>{milestone.expectedAge}m</small>
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

        <Droppable droppableId="timeline" direction="horizontal" type="milestone">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.timelineContainer}
            >
              <div id="timeline" className={styles.timeline}>
                {getMonthMarkers()}
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
                      title={`${milestone.title} - ${milestone.actualAge}m (Expected: ${milestone.expectedAge}m)`}
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