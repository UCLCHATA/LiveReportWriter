import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Check } from 'lucide-react';
import { assessmentTools, type AssessmentTool, type CompletedAssessment } from '../data/assessmentTools';
import styles from './AssessmentForm.module.css';

const QuickAdd: React.FC<{
  tool: AssessmentTool;
  onAdd: (assessment: CompletedAssessment) => void;
}> = ({ tool, onAdd }) => {
  const [details, setDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    module: tool.modules?.[0] || null,
    version: tool.versions?.[0] || null,
    clinician: '',
    notes: ''
  });

  const handleAdd = () => {
    onAdd({
      ...tool,
      ...details,
      id: `${tool.id}-${Date.now()}`
    });
  };

  return (
    <div className={styles.quickAddItem}>
      <div className={styles.toolInfo}>
        <h4>{tool.name}</h4>
        <span className={styles.timeNeeded}>({tool.timeNeeded})</span>
        <p>{tool.fullName}</p>
      </div>
      <div className={styles.toolControls}>
        <input
          type="date"
          value={details.date}
          onChange={(e) => setDetails(prev => ({ ...prev, date: e.target.value }))}
        />
        {tool.modules && (
          <select 
            value={details.module || ''}
            onChange={(e) => setDetails(prev => ({ ...prev, module: e.target.value }))}
          >
            {tool.modules.map(m => (
              <option key={m} value={m}>Module {m}</option>
            ))}
          </select>
        )}
        {tool.versions && (
          <select
            value={details.version || ''}
            onChange={(e) => setDetails(prev => ({ ...prev, version: e.target.value }))}
          >
            {tool.versions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus />
        </button>
      </div>
    </div>
  );
};

export const AssessmentForm: React.FC = () => {
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [activeCategory, setActiveCategory] = useState('core_diagnostic');

  const handleAddAssessment = (assessment: CompletedAssessment) => {
    setCompletedAssessments(prev => [...prev, assessment]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>Assessment Log</h3>
          <p>Record completed diagnostic tools</p>
        </div>
        <div className={styles.categorySelector}>
          <Filter className={styles.filterIcon} />
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="core_diagnostic">Core Diagnostic</option>
            <option value="developmental">Developmental</option>
            <option value="cognitive_attention">Cognitive & Attention</option>
            <option value="language_communication">Language & Communication</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {/* Quick Add Section */}
        <div className={styles.quickAddSection}>
          {assessmentTools[activeCategory].map(tool => (
            <QuickAdd 
              key={tool.id} 
              tool={tool} 
              onAdd={handleAddAssessment}
            />
          ))}
        </div>

        {/* Completed Assessments */}
        {completedAssessments.length > 0 && (
          <div className={styles.completedSection}>
            <h4>Completed Assessments</h4>
            <AnimatePresence>
              {completedAssessments.map(assessment => (
                <motion.div 
                  key={assessment.id}
                  className={styles.completedItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Check className={styles.checkIcon} />
                  <div className={styles.assessmentInfo}>
                    <div className={styles.assessmentHeader}>
                      <h4>{assessment.name}</h4>
                      {assessment.module && (
                        <span className={styles.moduleTag}>
                          Module {assessment.module}
                        </span>
                      )}
                      {assessment.version && (
                        <span className={styles.versionTag}>
                          {assessment.version}
                        </span>
                      )}
                    </div>
                    <p>{new Date(assessment.date).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.icfDomains}>
                    ICF: {assessment.icfDomains.join(', ')}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}; 