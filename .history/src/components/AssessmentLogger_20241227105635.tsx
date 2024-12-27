import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, MessageSquare } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  color: string;
  module?: string;
}

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

const AssessmentBubble: React.FC<{
  assessment: Assessment;
  isSelected: boolean;
  onClick: () => void;
}> = ({ assessment, isSelected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`
      w-full
      px-3 py-2
      rounded-lg
      text-[11px] font-medium
      border
      ${isSelected 
        ? 'bg-white border-blue-500 text-blue-700 shadow-sm' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }
      transition-all duration-200
    `}
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
}> = ({ assessment, onUpdate, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-gray-50 rounded-lg p-3"
  >
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm">{assessment.name}</span>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={assessment.date || ''}
          onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
          className="text-xs border rounded px-2 py-1 bg-white"
        />
        <button
          onClick={() => onRemove(assessment.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>
    </div>
    <input
      type="text"
      value={assessment.notes || ''}
      onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
      placeholder="Add assessment details..."
      className="mt-2 w-full text-sm border rounded px-2 py-1 bg-white"
    />
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
    <div className="w-full bg-white rounded-lg shadow-sm" style={{ border: '1px solid red' }}>
      {/* Assessment Selection Area */}
      <div className="p-4" style={{ border: '1px solid blue' }}>
        {/* Grid Container */}
        <div className="grid grid-cols-4 gap-4" style={{ border: '1px solid green' }}>
          {Object.values(assessmentTools).flat().map(tool => (
            <div key={tool.id} className="p-1" style={{ border: '1px solid purple' }}>
              <AssessmentBubble
                assessment={tool}
                isSelected={selectedAssessments.some(a => a.id === tool.id)}
                onClick={() => handleToggleAssessment(tool)}
              />
            </div>
          ))}
        </div>

        {/* Selected Items */}
        {selectedAssessments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="grid gap-3">
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