import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { assessmentTools, type AssessmentTool, type CompletedAssessment } from '../data/assessmentTools';
import styles from './AssessmentForm.module.css';

const TestBubble: React.FC<{
  tool: AssessmentTool;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ tool, isSelected, onToggle }) => (
  <button
    className={`${styles.testBubble} ${isSelected ? styles.selected : ''}`}
    onClick={onToggle}
    title={tool.fullName}
  >
    {tool.name}
    {isSelected ? <X className={styles.bubbleIcon} /> : <Plus className={styles.bubbleIcon} />}
  </button>
);

const SelectedTest: React.FC<{
  assessment: CompletedAssessment;
  onUpdate: (updates: Partial<CompletedAssessment>) => void;
  onRemove: () => void;
}> = ({ assessment, onUpdate, onRemove }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div 
      className={styles.selectedTest}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={styles.testHeader}>
        <div className={styles.testInfo}>
          <h4>{assessment.name}</h4>
          <span className={styles.fullName}>{assessment.fullName}</span>
        </div>
        <div className={styles.testControls}>
          <input
            type="date"
            value={assessment.date || ''}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className={styles.dateInput}
          />
          <button 
            className={styles.detailsButton}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </button>
          <button 
            className={styles.removeButton}
            onClick={onRemove}
          >
            <X />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className={styles.testDetails}>
          {assessment.modules && (
            <select 
              value={assessment.module || ''}
              onChange={(e) => onUpdate({ module: e.target.value })}
            >
              <option value="">Select Module...</option>
              {assessment.modules.map(m => (
                <option key={m} value={m}>Module {m}</option>
              ))}
            </select>
          )}
          {assessment.versions && (
            <select
              value={assessment.version || ''}
              onChange={(e) => onUpdate({ version: e.target.value })}
            >
              <option value="">Select Version...</option>
              {assessment.versions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Clinician name..."
            value={assessment.clinician || ''}
            onChange={(e) => onUpdate({ clinician: e.target.value })}
          />
          <textarea
            placeholder="Assessment notes..."
            value={assessment.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
          />
        </div>
      )}
    </motion.div>
  );
};

export const AssessmentForm: React.FC = () => {
  const [selectedTests, setSelectedTests] = useState<CompletedAssessment[]>([]);
  const allTools = Object.values(assessmentTools).flat();

  const handleToggleTest = (tool: AssessmentTool) => {
    const isSelected = selectedTests.some(t => t.id === tool.id);
    
    if (isSelected) {
      setSelectedTests(prev => prev.filter(t => t.id !== tool.id));
    } else {
      setSelectedTests(prev => [...prev, {
        ...tool,
        id: `${tool.id}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      }]);
    }
  };

  const handleUpdateTest = (id: string, updates: Partial<CompletedAssessment>) => {
    setSelectedTests(prev => 
      prev.map(test => 
        test.id === id ? { ...test, ...updates } : test
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>Assessment Log</h3>
          <p>Select tests to record</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.testBubbles}>
          {allTools.map(tool => (
            <TestBubble
              key={tool.id}
              tool={tool}
              isSelected={selectedTests.some(t => t.id.startsWith(tool.id))}
              onToggle={() => handleToggleTest(tool)}
            />
          ))}
        </div>

        {selectedTests.length > 0 && (
          <div className={styles.selectedTests}>
            <h4>Selected Tests</h4>
            <AnimatePresence>
              {selectedTests.map(test => (
                <SelectedTest
                  key={test.id}
                  assessment={test}
                  onUpdate={(updates) => handleUpdateTest(test.id, updates)}
                  onRemove={() => handleToggleTest(test)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}; 