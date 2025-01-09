import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertTriangle, Dumbbell, ThumbsUp } from 'lucide-react';
import { useFormState } from '../hooks/useFormState';
import styles from './AssessmentLogger.module.css';
import { debounce } from 'lodash';

// Assessment tools data with proper categorization
export const assessmentTools = {
  core_diagnostic: [
    { id: 'ados2', name: 'ADOS-2', color: '#4299E1', category: 'Core Diagnostic' },
    { id: '3di', name: '3Di', color: '#48BB78', category: 'Core Diagnostic' },
    { id: 'adir', name: 'ADI-R', color: '#ED8936', category: 'Core Diagnostic' }
  ],
  developmental: [
    { id: 'vineland3', name: 'Vineland-3', color: '#9F7AEA', category: 'Developmental' },
    { id: 'bayley4', name: 'Bayley-4', color: '#F687B3', category: 'Developmental' }
  ],
  cognitive_attention: [
    { id: 'qbtest', name: 'QbTest', color: '#4FD1C5', category: 'Cognitive & Attention' },
    { id: 'conners3', name: 'Conners-3', color: '#F6AD55', category: 'Cognitive & Attention' }
  ],
  language_communication: [
    { id: 'celf5', name: 'CELF-5', color: '#667EEA', category: 'Language & Communication' },
    { id: 'pls5', name: 'PLS-5', color: '#FC8181', category: 'Language & Communication' }
  ],
  other: [
    { id: 'other', name: 'Other Assessment', color: '#94A3B8', category: 'Other' }
  ]
};

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  color: string;
  category: string;
  selected?: boolean;
  status?: 'pending' | 'completed' | 'scheduled';
  addedAt?: string;
  lastModified?: string;
}

const AssessmentBubble: React.FC<{
  assessment: Assessment;
  isSelected: boolean;
  onClick: () => void;
}> = ({ assessment, isSelected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`${styles.bubble} ${isSelected ? styles.selected : ''}`}
    style={{
      background: isSelected ? assessment.color : undefined,
      borderColor: isSelected ? assessment.color : undefined
    }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {assessment.name}
  </motion.button>
);

const AssessmentEntry: React.FC<{
  assessment: Assessment;
  onUpdate: (id: string, updates: Partial<Assessment>) => void;
  onRemove: (id: string) => void;
}> = ({ assessment, onUpdate, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState(assessment.id === 'other' ? assessment.name : '');
  const [localNotes, setLocalNotes] = useState(assessment.notes || '');

  // Debounced update functions
  const debouncedUpdateNotes = useCallback(
    debounce((id: string, notes: string) => {
      onUpdate(id, { notes });
    }, 1000),
    [onUpdate]
  );

  const debouncedUpdateTitle = useCallback(
    debounce((id: string, name: string) => {
      onUpdate(id, { name: name || 'Other Assessment' });
    }, 1000),
    [onUpdate]
  );

  useEffect(() => {
    setLocalNotes(assessment.notes || '');
  }, [assessment.notes]);

  useEffect(() => {
    setCustomTitle(assessment.id === 'other' ? assessment.name : assessment.name);
  }, [assessment.id, assessment.name]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setLocalNotes(newNotes);
    debouncedUpdateNotes(assessment.id, newNotes);
  };

  const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setCustomTitle(newTitle);
    debouncedUpdateTitle(assessment.id, newTitle);
  };

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className={styles.assessmentEntry}
      >
        <div className={styles.entryHeader}>
          <div className={styles.entryTitle}>
            <div 
              className={styles.entryColor}
              style={{ backgroundColor: assessment.color }}
            />
            {assessment.id === 'other' ? (
              <input
                type="text"
                value={customTitle}
                onChange={handleCustomTitleChange}
                placeholder="Enter assessment name"
                className={styles.customTitleInput}
              />
            ) : (
              <span className={styles.entryName}>{assessment.name}</span>
            )}
            <span className={styles.entryCategory}>{assessment.category}</span>
          </div>

          <div className={styles.entryControls}>
            <input
              type="date"
              value={assessment.date || ''}
              onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
              className={styles.dateInput}
            />
            <button
              onClick={() => onRemove(assessment.id)}
              className={styles.removeButton}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className={styles.doubleClickHint}>
          Double-click to expand
        </div>

        <div className={styles.entryContent} onDoubleClick={handleDoubleClick}>
          <textarea
            value={localNotes}
            onChange={handleNotesChange}
            placeholder="Add key observations and conclusions..."
            className={styles.notesInput}
            rows={3}
          />
        </div>
      </motion.div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <div 
                  className={styles.entryColor}
                  style={{ backgroundColor: assessment.color }}
                />
                {assessment.id === 'other' ? (
                  <input
                    type="text"
                    value={customTitle}
                    onChange={handleCustomTitleChange}
                    placeholder="Enter assessment name"
                    className={styles.customTitleInput}
                  />
                ) : (
                  assessment.name
                )}
              </h3>
              <button className={styles.closeButton} onClick={handleModalClose}>
                <X size={16} />
              </button>
            </div>
            <textarea
              value={localNotes}
              onChange={handleNotesChange}
              placeholder="Add key observations and conclusions..."
              className={styles.modalTextarea}
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
};

interface ComponentProps {
  data: any;
  onChange: (data: any) => void;
}

export const AssessmentLogger: React.FC<ComponentProps> = ({ data, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastSaveRef = useRef<number>(0);
  const MIN_SAVE_INTERVAL = 2000; // Increased to 2 seconds

  // Initialize state from props or create default with proper typing
  const assessmentLog = useMemo(() => {
    const defaultState = {
      type: 'assessmentLog' as const,
      selectedAssessments: [],
      entries: {},
      progress: 0,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    };

    if (!data) return defaultState;

    // Ensure proper data structure
    return {
      ...defaultState,
      ...data,
      selectedAssessments: data.selectedAssessments?.map((assessment: Assessment) => ({
        ...assessment,
        date: assessment.date || '',
        notes: assessment.notes || '',
        status: assessment.status || 'pending'
      })) || [],
      entries: data.entries ? Object.fromEntries(
        Object.entries(data.entries).map(([key, entry]) => [
          key,
          {
            ...(entry as Assessment),
            date: (entry as Assessment).date || '',
            notes: (entry as Assessment).notes || '',
            status: (entry as Assessment).status || 'pending'
          }
        ])
      ) : {},
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
  }, [data]);

  const { selectedAssessments = [], entries: assessmentEntries = {} } = assessmentLog;

  const shouldSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    return timeSinceLastSave >= MIN_SAVE_INTERVAL;
  }, []);

  const handleToggleAssessment = useCallback((assessment: Assessment) => {
    if (!shouldSave()) return;

    const exists = selectedAssessments.find((a: Assessment) => a.id === assessment.id);
    const newState = {
      ...assessmentLog,
      selectedAssessments: exists 
        ? selectedAssessments.filter((a: Assessment) => a.id !== assessment.id)
        : [...selectedAssessments, {
            ...assessment,
            date: '',
            notes: '',
            status: 'pending'
          }],
      entries: exists
        ? Object.fromEntries(
            Object.entries(assessmentEntries).filter(([key]) => key !== assessment.id)
          )
        : {
            ...assessmentEntries,
            [assessment.id]: {
              id: assessment.id,
              name: assessment.name,
              category: assessment.category,
              color: assessment.color,
              date: '',
              notes: '',
              status: 'pending',
              addedAt: new Date().toISOString()
            }
          },
      lastUpdated: new Date().toISOString()
    };
    
    lastSaveRef.current = Date.now();
    onChange(newState);
  }, [assessmentLog, selectedAssessments, assessmentEntries, onChange, shouldSave]);

  const handleUpdateAssessment = useCallback((id: string, updates: Partial<Assessment>) => {
    if (!shouldSave()) return;

    const newState = {
      ...assessmentLog,
      entries: {
        ...assessmentEntries,
        [id]: {
          ...assessmentEntries[id],
          ...updates,
          lastModified: new Date().toISOString()
        }
      },
      lastUpdated: new Date().toISOString()
    };
    
    lastSaveRef.current = Date.now();
    onChange(newState);
  }, [assessmentLog, assessmentEntries, onChange, shouldSave]);

  const handleRemoveAssessment = useCallback((id: string) => {
    if (!shouldSave()) return;

    const newState = {
      ...assessmentLog,
      selectedAssessments: selectedAssessments.filter((a: Assessment) => a.id !== id),
      entries: Object.fromEntries(
        Object.entries(assessmentEntries).filter(([key]) => key !== id)
      ),
      lastUpdated: new Date().toISOString()
    };
    
    lastSaveRef.current = Date.now();
    onChange(newState);
  }, [assessmentLog, selectedAssessments, assessmentEntries, onChange, shouldSave]);

  // Calculate and update progress whenever assessments change
  useEffect(() => {
    const totalAssessments = selectedAssessments.length;
    if (totalAssessments === 0) return;

    const completedAssessments = selectedAssessments.filter(
      (assessment: Assessment) => assessment.date && assessment.notes && assessment.status === 'completed'
    ).length;

    const progress = Math.round((completedAssessments / totalAssessments) * 100);
    const isComplete = completedAssessments === totalAssessments;

    if (progress !== assessmentLog.progress || isComplete !== assessmentLog.isComplete) {
      onChange({
        ...assessmentLog,
        progress,
        isComplete,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [selectedAssessments, assessmentLog, onChange]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Assessment selection area */}
        <div className={styles.bubbleGrid}>
          {Object.entries(assessmentTools).map(([key, tools]) => 
            tools.map((assessment: Assessment) => (
              <AssessmentBubble
                key={assessment.id}
                assessment={assessment}
                isSelected={selectedAssessments?.some((a: Assessment) => a.id === assessment.id) || false}
                onClick={() => handleToggleAssessment(assessment)}
              />
            ))
          )}
        </div>

        {/* Selected assessments section */}
        {selectedAssessments?.length > 0 && (
          <div className={styles.assessmentEntries}>
            <div className={styles.entriesHeader}>
              <h3 className={styles.entriesTitle}>Selected Assessments</h3>
            </div>
            <div className={styles.entriesList}>
              <AnimatePresence>
                {selectedAssessments.map((assessment: Assessment, index: number) => (
                  <React.Fragment key={assessment.id}>
                    <AssessmentEntry
                      assessment={{
                        ...assessment,
                        ...assessmentEntries[assessment.id]
                      }}
                      onUpdate={handleUpdateAssessment}
                      onRemove={handleRemoveAssessment}
                    />
                    {index < selectedAssessments.length - 1 && (
                      <div className={styles.separator} />
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentLogger; 