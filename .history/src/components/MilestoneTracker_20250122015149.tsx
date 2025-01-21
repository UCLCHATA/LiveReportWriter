import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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

const DraggableMilestone: React.FC<{
  milestone: Milestone;
  category: CategoryType;
  onCustomConcern?: (text: string) => void;
}> = React.memo(({ milestone, category, onCustomConcern }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showDifference, setShowDifference] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: milestone.id,
    data: { milestone },
    disabled: milestone.id === 'custom-concern'
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getDifferenceText = () => {
    if (milestone.actualAge === undefined || milestone.expectedAge === 0) return null;
    const diff = milestone.actualAge - milestone.expectedAge;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const differenceText = getDifferenceText();
  const isDelayed = milestone.actualAge !== undefined && 
                    milestone.expectedAge !== 0 && 
                    milestone.actualAge > milestone.expectedAge;

  const tooltipText = milestone.actualAge !== undefined 
    ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}${
      differenceText ? ` - ${isDelayed ? 'Delayed' : 'Advanced'} by ${Math.abs(milestone.actualAge - milestone.expectedAge)}m` : ''
    }`
    : categoryInfo[category].tooltips[milestone.title] || milestone.title;

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
      data-editing={isEditing}
      title={tooltipText}
      style={style}
      whileHover={{ scale: isCustomButton ? 1 : 1.05 }}
      whileTap={{ scale: isCustomButton ? 1 : 0.95 }}
      onClick={handleCustomClick}
      onMouseEnter={() => setShowDifference(true)}
      onMouseLeave={() => setShowDifference(false)}
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
          {milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (
            <div 
              className={styles.monthCircle}
              data-delayed={isDelayed}
              data-early={!isDelayed}
            >
              <span className={`${styles.monthText} ${showDifference ? styles.showDifference : ''} ${isDelayed ? styles.delayedText : styles.advancedText}`}>
                {showDifference && differenceText ? differenceText : `${milestone.actualAge}m`}
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
});

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
  const [localValue, setLocalValue] = useState(value || '');

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

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
      <div className={styles.textareaWrapper}>
        <textarea
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholderText}
          className={styles.historyTextarea}
        />
      </div>
    </div>
  );
};

const STORAGE_KEY = 'milestone_data';
const CACHE_KEY = 'milestone_cache';

interface MilestoneTrackerProps {
  chataId: string;
  data: MilestoneData;
  onChange: (data: MilestoneData) => void;
}

interface MilestoneData {
  type: string;
  milestones: Milestone[];
  history: string;
  lastUpdated: string;
  timelineImage?: string;
  currentMonth?: number | null;
  activeMilestone?: Milestone | null;
}

interface Milestone {
  id: string;
  title: string;
  category: "communication" | "motor" | "social" | "concerns";
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: "typical" | "monitor" | "delayed" | "pending";
}

interface NewMilestone extends Omit<Milestone, 'id' | 'status'> {
  category: "communication" | "motor" | "social" | "concerns";
}

interface RawMilestone {
  id: string;
  title: string;
  category: string;
  expectedAge: number;
  actualAge?: number;
  stackPosition?: number;
  status?: string;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = React.memo(({ chataId, data, onChange }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(data.activeMilestone || null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(data.currentMonth || null);
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const [includeInReport, setIncludeInReport] = useState(false);
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

  // Memoize milestone calculations
  const processedMilestones = useMemo(() => {
    return milestones.map(milestone => ({
      ...milestone,
      stackPosition: getStackPosition(milestones, currentMonth, milestone.id),
      status: milestone.actualAge ? determineStatus(milestone.actualAge, milestone.expectedAge) : 'pending'
    }));
  }, [milestones, currentMonth]);

  const shouldSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    return timeSinceLastSave >= MIN_SAVE_INTERVAL;
  }, []);

  const handleHistoryChange = useCallback((text: string) => {
    const updatedData = {
      type: 'milestoneTracker',
      milestones,
      history: text,
      lastUpdated: new Date().toISOString()
    };
    onChange(updatedData);
  }, [milestones, onChange]);

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
      id: `custom-concern-${Date.now()}`,
      title: text,
      category: 'concerns',
      expectedAge: 0
    };

    const updatedMilestones = [...milestones.filter(m => m.id !== 'custom-concern'), newMilestone, {
      id: 'custom-concern',
      title: '+',
      category: 'concerns',
      expectedAge: 0
    }];

    const updatedData = {
      type: 'milestoneTracker',
      milestones: updatedMilestones,
      history: historyText,
      lastUpdated: new Date().toISOString()
    };

    lastSaveRef.current = Date.now();
    onChange(updatedData);
  }, [milestones, historyText, onChange, shouldSave]);

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

  const handleAddMilestone = (milestone: NewMilestone) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: uuidv4(),
      status: getMilestoneStatus(milestone as Milestone)
    };

    const updatedData: MilestoneData = {
      type: data.type,
      milestones: [...data.milestones, newMilestone],
      history: data.history,
      lastUpdated: new Date().toISOString(),
      currentMonth: data.currentMonth,
      activeMilestone: data.activeMilestone,
      timelineImage: data.timelineImage
    };
    onChange(updatedData);
  };

  const handleUpdateMilestone = (milestone: Milestone) => {
    const updatedMilestones = data.milestones.map(m => 
      m.id === milestone.id ? {
        ...milestone,
        status: getMilestoneStatus(milestone)
      } : m
    ) as Milestone[];
    
    const updatedData: MilestoneData = {
      type: data.type,
      milestones: updatedMilestones,
      history: data.history,
      lastUpdated: new Date().toISOString(),
      currentMonth: data.currentMonth,
      activeMilestone: data.activeMilestone,
      timelineImage: data.timelineImage
    };
    onChange(updatedData);
  };

  const handleTimelineUpdate = () => {
    const updatedData: MilestoneData = {
      type: data.type,
      milestones: (data.milestones as RawMilestone[]).map(m => {
        const milestone: Milestone = {
          id: m.id,
          title: m.title,
          category: m.category as "communication" | "motor" | "social" | "concerns",
          expectedAge: m.expectedAge,
          actualAge: m.actualAge,
          stackPosition: m.stackPosition,
          status: (m.status || 'pending') as "typical" | "monitor" | "delayed" | "pending"
        };
        return milestone;
      }),
      history: data.history,
      lastUpdated: new Date().toISOString(),
      currentMonth: currentMonth || undefined,
      activeMilestone: activeMilestone || undefined,
      timelineImage: data.timelineImage
    };
    onChange(updatedData);
  };

  const handleIncludeClick = async () => {
    if (!timelineRef.current) return;

    try {
      const canvas = await html2canvas(timelineRef.current, {
        scale: 0.75,
        logging: false,
        useCORS: true,
        backgroundColor: null
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Timeline_${chataId}.png`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'image/png');

      // Show dialog
      alert('Please add this timeline image to the template after you receive the generated report in editable word doc form.');
    } catch (error) {
      console.error('Failed to capture timeline:', error);
    }
  };

  const getMilestoneStatus = (milestone: Milestone): "typical" | "monitor" | "delayed" | "pending" => {
    if (!milestone.actualAge) return 'pending';
    const diff = milestone.actualAge - milestone.expectedAge;
    if (diff <= 3) return 'typical';
    if (diff <= 6) return 'monitor';
    return 'delayed';
  };

  // Remove unused functions and variables
  const handleTimelineImageCapture = () => {
    handleIncludeClick();
  };

  // Update the component to use handleTimelineImageCapture instead of captureTimelineImage
  useEffect(() => {
    if (data.milestones.length > 0) {
      handleTimelineImageCapture();
    }
  }, [data.milestones]);

  // Debounce the mark complete/undo handler
  const handleMarkComplete = useCallback(
    debounce((milestone: Milestone, isComplete: boolean) => {
      if (currentMonth === null) return;
      
      const updatedMilestones = milestones.map((m: Milestone) => {
        if (m.id === milestone.id) {
          return {
            ...m,
            actualAge: isComplete ? currentMonth : undefined
          };
        }
        return m;
      });
      onChange({ ...data, milestones: updatedMilestones });
    }, 300),
    [milestones, currentMonth, onChange, data]
  );

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
            onClick={handleIncludeClick}
            data-included={false}
          >
            <span>Download Timeline</span>
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
                  .filter((m: Milestone) => m.actualAge !== undefined)
                  .map((milestone: Milestone) => (
                    <motion.div
                      key={milestone.id}
                      className={styles.timelineMilestone}
                      style={{
                        left: `${(milestone.actualAge || 0) / maxAge * 100}%`,
                        top: `${(milestone.stackPosition || 0) * 30}px`,
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
                    </motion.div>
                  ))}
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
});

export default MilestoneTracker; 