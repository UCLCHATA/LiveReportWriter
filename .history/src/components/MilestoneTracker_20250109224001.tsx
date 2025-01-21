import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';
import html2canvas from 'html2canvas';

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
      'Rigid play patterns': 'Repetitive play sequences, strong preference for sameness, difficulty with changes in routine',
      'Limited social engagement': 'Reduced social initiation, parallel play preference, limited peer interaction',
      'Sensory seeking/avoiding': 'Unusual responses to sensory input, covering ears, visual fascinations, tactile sensitivity',
      'custom-concern': 'Add a custom developmental concern'
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

interface DraggableMilestoneProps {
  milestone: Milestone;
  category: CategoryType;
  onCustomConcern?: (text: string) => void;
}

const DraggableMilestone: React.FC<DraggableMilestoneProps> = ({ milestone, category, onCustomConcern }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: milestone.id,
    data: { milestone }
  });

  const isEarly = milestone.actualAge !== undefined && milestone.expectedAge !== undefined && 
                  milestone.actualAge < milestone.expectedAge;
  const isDelayed = milestone.actualAge !== undefined && milestone.expectedAge !== undefined && 
                    milestone.actualAge > milestone.expectedAge;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 100 : 'auto'
  } : undefined;

  if (milestone.id === 'custom-concern') {
    return (
      <button
        ref={setNodeRef}
        style={style}
        className={styles.milestone}
        data-category={category}
        data-milestone-id="custom-concern"
        onClick={() => onCustomConcern?.('New concern')}
        {...attributes}
        {...listeners}
      >
        +
      </button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.milestone}
      data-category={category}
      data-early={isEarly}
      data-delayed={isDelayed}
      {...attributes}
      {...listeners}
    >
      {milestone.title}
      {milestone.actualAge !== undefined && (
        <div className={styles.monthCircle}>
          <span className={`${styles.monthText} ${isDelayed ? styles.delayedText : ''} ${isEarly ? styles.advancedText : ''}`}>
            {milestone.actualAge}m
          </span>
        </div>
      )}
    </div>
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

  const placedMilestones = milestones
    .filter(m => m.actualAge !== undefined && m.id !== currentId);

  let row = 0; // Always start from top
  let hasOverlap = true;
  const maxRows = 7;

  while (hasOverlap && row < maxRows) {
    hasOverlap = placedMilestones.some((m: Milestone) => {
      const distance = Math.abs((m.actualAge || 0) - currentMonth);
      const mightOverlap = distance <= 20;
      
      const sameRow = milestones
        .find((existing: Milestone) => existing.id === m.id)?.stackPosition === row;

      return mightOverlap && sameRow;
    });

    if (hasOverlap) {
      row++;
    }
  }

  // If we've hit the limit, find the least crowded row
  if (row >= maxRows) {
    const rowCounts = new Array(maxRows).fill(0);
    placedMilestones.forEach(m => {
      const mRow = m.stackPosition || 0;
      if (mRow < maxRows) {
        rowCounts[mRow]++;
      }
    });
    row = rowCounts.indexOf(Math.min(...rowCounts));
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
    id: 'rigid-play',
    title: 'Rigid play patterns', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'limited-social',
    title: 'Limited social engagement', 
    category: 'concerns', 
    expectedAge: 0
  },
  { 
    id: 'sensory-patterns',
    title: 'Sensory seeking/avoiding', 
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.historyBox}>
      <h3>History of Concerns</h3>
      <div className={styles.textareaWrapper}>
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholderText}
          className={styles.historyTextarea}
        />
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            {placeholderText}
          </div>
        </div>
      </div>
    </div>
  );
};

const STORAGE_KEY = 'milestone_data';
const CACHE_KEY = 'milestone_cache';

export const MilestoneTracker: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const [includeInReport, setIncludeInReport] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maxAge = 72;
  const [customConcernCount, setCustomConcernCount] = useState(0);
  const lastSaveRef = useRef<number>(0);
  const MIN_SAVE_INTERVAL = 1000; // 1 second minimum between saves

  // Initialize data if not present
  useEffect(() => {
    if (!data || !data.milestones || data.milestones.length === 0) {
      onChange({
        type: 'milestoneTracker',
        milestones: initialMilestones,
        history: '',
        lastUpdated: new Date().toISOString()
      });
    }
  }, [data, onChange]);

  const milestones = data?.milestones || initialMilestones;
  const historyText = data?.history || '';

  const shouldSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    return timeSinceLastSave >= MIN_SAVE_INTERVAL;
  }, []);

  const handleHistoryChange = useCallback((text: string) => {
    if (!shouldSave()) return;
    
    const updatedData = {
      type: 'milestoneTracker',
      milestones,
      history: text,
      lastUpdated: new Date().toISOString()
    };
    
    lastSaveRef.current = Date.now();
    onChange(updatedData);
  }, [milestones, onChange, shouldSave]);

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

    if (!shouldSave()) return;

    const updatedData = {
      type: 'milestoneTracker',
      milestones: updatedMilestones,
      history: historyText,
      lastUpdated: new Date().toISOString()
    };

    lastSaveRef.current = Date.now();
    onChange(updatedData);
    setActiveMilestone(null);
    setCurrentMonth(null);
  }, [milestones, historyText, onChange, shouldSave]);

  const handleCustomConcern = useCallback((text: string) => {
    if (!shouldSave()) return;

    const newMilestone: Milestone = {
      id: `custom-concern-${customConcernCount + 1}`,
      title: text,
      category: 'concerns',
      expectedAge: 0
    };

    const updatedMilestones = [...milestones, newMilestone];
    const updatedData = {
      type: 'milestoneTracker',
      milestones: updatedMilestones,
      history: historyText,
      lastUpdated: new Date().toISOString()
    };

    lastSaveRef.current = Date.now();
    onChange(updatedData);
    setCustomConcernCount(prev => prev + 1);
  }, [milestones, historyText, customConcernCount, onChange, shouldSave]);

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

  const captureTimelineImage = async () => {
    if (wrapperRef.current) {
      try {
        // Store original styles
        const originalMargin = wrapperRef.current.style.marginBottom;
        const originalHeight = wrapperRef.current.style.height;
        
        // Set temporary styles for capture
        wrapperRef.current.style.marginBottom = '0px';
        wrapperRef.current.style.height = '240px'; // Increased height to accommodate labels
        
        const canvas = await html2canvas(wrapperRef.current, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          onclone: (clonedDoc) => {
            const clonedWrapper = clonedDoc.querySelector(`.${styles.timelineWrapper}`);
            if (clonedWrapper) {
              (clonedWrapper as HTMLElement).style.marginBottom = '0px';
              (clonedWrapper as HTMLElement).style.height = '240px';
              
              // Make all month markers and labels visible
              const markers = clonedWrapper.querySelectorAll(`.${styles.monthMarker}`);
              markers.forEach((marker) => {
                (marker as HTMLElement).style.opacity = '1';
                const markerLine = marker.querySelector(`.${styles.markerLine}`);
                if (markerLine) {
                  (markerLine as HTMLElement).style.opacity = '1';
                }
                const label = marker.querySelector(`.${styles.markerLabel}`);
                if (label) {
                  (label as HTMLElement).style.opacity = '1';
                  (label as HTMLElement).style.visibility = 'visible';
                  (label as HTMLElement).style.bottom = '-25px';
                }
              });
            }
          }
        });

        // Restore original styles
        wrapperRef.current.style.marginBottom = originalMargin;
        wrapperRef.current.style.height = originalHeight;
        
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing timeline image:', error);
        return null;
      }
    }
    return null;
  };

  const handleIncludeInReportToggle = async () => {
    setIncludeInReport(prev => !prev);
    
    // If we're including in report, capture and preview the image
    if (!includeInReport) {
      try {
        const timelineImage = await captureTimelineImage();
        if (timelineImage) {
          // Open image in new tab
          const newTab = window.open();
          if (newTab) {
            newTab.document.write(`<img src="${timelineImage}" alt="Timeline" />`);
          }
        }
      } catch (error) {
        console.error('Error capturing timeline image:', error);
      }
    }
  };

  useEffect(() => {
    const updateData = async () => {
      if (includeInReport) {
        const timelineImage = await captureTimelineImage();
        onChange({
          ...data,
          timelineImage,
          includeTimelineInReport: true,
          lastUpdated: new Date().toISOString()
        });
      } else {
        onChange({
          ...data,
          timelineImage: null,
          includeTimelineInReport: false,
          lastUpdated: new Date().toISOString()
        });
      }
    };

    updateData();
  }, [includeInReport, onChange, data]);

  const isOverlapping = (milestone: Milestone & { actualAge: number }, otherMilestones: Milestone[]): boolean => {
    return otherMilestones.some(other => {
      if (other.actualAge === undefined || other.id === milestone.id) return false;
      
      // Check if the number rectangle overlaps with another bubble
      // Number rectangle is positioned at right: -8px, width: 16px
      const thisRight = milestone.actualAge + 0.5; // Add small offset for number rectangle
      const otherLeft = other.actualAge - 0.5; // Add small offset for bubble width
      
      const numberRectangleOverlaps = thisRight >= otherLeft && milestone.actualAge <= other.actualAge;
      
      if (numberRectangleOverlaps) {
        const thisStack = milestone.stackPosition || 0;
        const otherStack = other.stackPosition || 0;
        
        // Only consider it overlapping if:
        // 1. This milestone is in a row above the other milestone
        // 2. They're in adjacent rows
        return thisStack < otherStack && Math.abs(thisStack - otherStack) === 1;
      }
      return false;
    });
  };

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

        <div ref={wrapperRef} className={styles.timelineWrapper}>
          <button 
            className={styles.includeInReportButton}
            onClick={handleIncludeInReportToggle}
            title={includeInReport ? "Remove from report" : "Include in report"}
            data-included={includeInReport}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              {includeInReport ? (
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              ) : (
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              )}
            </svg>
            {includeInReport ? "Remove from Report" : "Include in Report"}
          </button>
          <div ref={timelineRef} className={styles.timeline}>
            {Array.from({ length: maxAge + 1 }, (_, i) => (
              <TimelineMonth key={i} month={i} maxAge={maxAge} />
            ))}

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
                  .filter((m: Milestone): m is Milestone & { actualAge: number } => m.actualAge !== undefined)
                  .map((milestone: Milestone & { actualAge: number }) => {
                    const hasOverlap = isOverlapping(milestone, milestones);
                    
                    return (
                      <motion.div
                        key={milestone.id}
                        className={styles.timelineMilestone}
                        style={{
                          left: `${milestone.actualAge / maxAge * 100}%`,
                          top: `${(milestone.stackPosition || 0) * 30}px`,
                          transform: 'translate(-50%, 0)',
                          opacity: hasOverlap ? 0.4 : 1
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: hasOverlap ? 0.4 : 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <DraggableMilestone
                          milestone={milestone}
                          category={milestone.category}
                        />
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DndContext>
      
      <div className={styles.historyBox}>
        <h3>History of Concerns</h3>
        <div className={styles.textareaWrapper}>
          <textarea
            value={historyText}
            onChange={(e) => handleHistoryChange(e.target.value)}
            placeholder={`Document history of concerns, including:
• Age when parents first noticed differences
• Early signs (e.g., limited eye contact, delayed babbling)
• Response to name and social engagement
• Changes in development patterns
• Environmental factors and adaptations
• Impact on daily activities and routines
• Family history of developmental conditions`}
            className={styles.historyTextarea}
            title={`Document history of concerns, including:
• Age when parents first noticed differences
• Early signs (e.g., limited eye contact, delayed babbling)
• Response to name and social engagement
• Changes in development patterns
• Environmental factors and adaptations
• Impact on daily activities and routines
• Family history of developmental conditions`}
          />
        </div>
      </div>
    </div>
  );
};

export default MilestoneTracker; 