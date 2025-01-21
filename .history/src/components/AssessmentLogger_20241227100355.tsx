import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, MessageSquare } from 'lucide-react';

// Keep the assessmentTools data structure but simplify for our needs
const assessmentTools = {
  core_diagnostic: [
    { id: 'ados2', name: 'ADOS-2', color: '#4299E1' },
    { id: '3di', name: '3Di', color: '#48BB78' },
    { id: 'adir', name: 'ADI-R', color: '#ED8936' }
  ],
  developmental: [
    { id: 'vineland3', name: 'Vineland-3', color: '#9F7AEA' },
    { id: 'bayley4', name: 'Bayley-4', color: '#F687B3' }
  ],
  cognitive_attention: [
    { id: 'qbtest', name: 'QbTest', color: '#4FD1C5' },
    { id: 'conners3', name: 'Conners-3', color: '#F6AD55' }
  ],
  language_communication: [
    { id: 'celf5', name: 'CELF-5', color: '#667EEA' },
    { id: 'pls5', name: 'PLS-5', color: '#FC8181' }
  ]
};

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  color: string;
}

const AssessmentBubble: React.FC<{
  assessment: Assessment;
  isSelected: boolean;
  onClick: () => void;
}> = ({ assessment, isSelected, onClick }) => (
  <motion.div
    onClick={onClick}
    className={`
      inline-block rounded-full px-3 py-1 cursor-pointer text-sm
      transition-colors duration-200
      ${isSelected ? 'text-white shadow-sm' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'}
      mr-1 mb-1
    `}
    style={{
      backgroundColor: isSelected ? assessment.color : undefined
    }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {assessment.name}
  </motion.div>
);

const AssessmentEntry: React.FC<{
  assessment: Assessment;
  onUpdate: (id: string, updates: Partial<Assessment>) => void;
  onRemove: (id: string) => void;
}> = ({ assessment, onUpdate, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center gap-2 bg-white border rounded-lg p-2"
  >
    <div
      className="w-1 h-6 rounded-full"
      style={{ backgroundColor: assessment.color }}
    />
    <div className="font-medium text-xs min-w-[80px]">{assessment.name}</div>
    <input
      type="date"
      value={assessment.date || ''}
      onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
      className="text-xs border rounded px-2 py-0.5 w-28"
    />
    <input
      type="text"
      value={assessment.notes || ''}
      onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
      placeholder="Add key observations..."
      className="text-xs border rounded px-2 py-0.5 flex-1 min-w-[180px]"
    />
    <button
      onClick={() => onRemove(assessment.id)}
      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
    >
      <X size={12} />
    </button>
  </motion.div>
);

export const AssessmentLogger: React.FC = () => {
  const [selectedAssessments, setSelectedAssessments] = useState<Assessment[]>([]);
  
  const handleToggleAssessment = (assessment: Assessment) => {
    const exists = selectedAssessments.find(a => a.id === assessment.id);
    if (exists) {
      setSelectedAssessments(prev => prev.filter(a => a.id !== assessment.id));
    } else {
      setSelectedAssessments(prev => [...prev, { ...assessment, date: '', notes: '' }]);
    }
  };

  const handleUpdateAssessment = (id: string, updates: Partial<Assessment>) => {
    setSelectedAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  };

  const handleRemoveAssessment = (id: string) => {
    setSelectedAssessments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-4">
        {/* Assessment Categories */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(assessmentTools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.replace('_', ' ')}
              </h3>
              <div className="flex flex-wrap">
                {tools.map(tool => (
                  <AssessmentBubble
                    key={tool.id}
                    assessment={tool}
                    isSelected={selectedAssessments.some(a => a.id === tool.id)}
                    onClick={() => handleToggleAssessment(tool)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Assessments List */}
        {selectedAssessments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Selected Assessments
            </h3>
            <div className="space-y-1.5">
              <AnimatePresence>
                {selectedAssessments.map(assessment => (
                  <AssessmentEntry
                    key={assessment.id}
                    assessment={assessment}
                    onUpdate={handleUpdateAssessment}
                    onRemove={handleRemoveAssessment}
                  />
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