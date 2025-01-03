import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertTriangle, Dumbbell, ThumbsUp } from 'lucide-react';
import { useFormState } from '../hooks/useFormState';
import styles from './AssessmentLogger.module.css';

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

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setCustomTitle(newTitle);
    onUpdate(assessment.id, { name: newTitle || 'Other Assessment' });
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
            value={assessment.notes || ''}
            onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
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
              value={assessment.notes || ''}
              onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
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

  // Initialize state from props or create default
  const assessmentLog = data || {
    type: 'assessmentLog',
    selectedAssessments: [],
    entries: {},
    lastUpdated: new Date().toISOString()
  };

  const { selectedAssessments = [], entries: assessmentEntries = {} } = assessmentLog;

  const handleToggleAssessment = (assessment: Assessment) => {
    const exists = selectedAssessments.find((a: Assessment) => a.id === assessment.id);
    const newState = {
      ...assessmentLog,
      selectedAssessments: exists 
        ? selectedAssessments.filter((a: Assessment) => a.id !== assessment.id)
        : [...selectedAssessments, assessment],
      entries: exists
        ? Object.fromEntries(
            Object.entries(assessmentEntries).filter(([key]) => key !== assessment.id)
          )
        : {
            ...assessmentEntries,
            [assessment.id]: {
              date: '',
              notes: '',
              addedAt: new Date().toISOString()
            }
          },
      lastUpdated: new Date().toISOString()
    };
    
    onChange(newState);
  };

  const handleUpdateAssessment = (id: string, updates: Partial<Assessment>) => {
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
    
    onChange(newState);
  };

  const handleRemoveAssessment = (id: string) => {
    const newState = {
      ...assessmentLog,
      selectedAssessments: selectedAssessments.filter((a: Assessment) => a.id !== id),
      entries: Object.fromEntries(
        Object.entries(assessmentEntries).filter(([key]) => key !== id)
      ),
      lastUpdated: new Date().toISOString()
    };
    
    onChange(newState);
  };

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