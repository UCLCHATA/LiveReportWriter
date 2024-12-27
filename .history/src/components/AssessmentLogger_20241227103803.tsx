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
      py-2 px-4
      text-[11px] font-medium
      rounded-full
      transition-all duration-200
      shadow-sm
      w-full
      ${isSelected 
        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
      }
    `}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
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
    className="flex items-center gap-2 bg-white hover:bg-gray-50 p-2 rounded-lg group"
  >
    <div className="flex-1 flex items-center gap-3">
      <div className="font-medium text-[11px] text-gray-700 min-w-[80px]">
        {assessment.name}
      </div>
      <input
        type="date"
        value={assessment.date || ''}
        onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
        className="text-[11px] border rounded px-2 py-0.5 w-32 bg-white"
      />
      <select
        value={assessment.module || ''}
        onChange={(e) => onUpdate(assessment.id, { module: e.target.value })}
        className="text-[11px] border rounded px-2 py-0.5 w-24 bg-white"
      >
        <option value="">Module...</option>
        {assessment.id === 'ados2' && (
          ['1', '2', '3', '4', 'T'].map(m => (
            <option key={m} value={m}>Module {m}</option>
          ))
        )}
      </select>
      <input
        type="text"
        value={assessment.notes || ''}
        onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
        placeholder="Add location..."
        className="text-[11px] border rounded px-2 py-0.5 w-32 bg-white"
      />
    </div>
    <button
      onClick={() => onRemove(assessment.id)}
      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
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
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col h-full">
      <div className="p-4">
        {/* Category Headers */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Object.keys(assessmentTools).map(category => (
            <h3 key={category} className="text-[9px] font-bold text-gray-400 uppercase text-center">
              {category.replace('_', ' ')}
            </h3>
          ))}
        </div>

        {/* Assessment Bubbles in 4x4 Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Object.entries(assessmentTools).map(([category, tools]) => (
            <div key={category} className="flex flex-col gap-2">
              {tools.map(tool => (
                <AssessmentBubble
                  key={tool.id}
                  assessment={tool}
                  isSelected={selectedAssessments.some(a => a.id === tool.id)}
                  onClick={() => handleToggleAssessment(tool)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Selected Assessments */}
        {selectedAssessments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-[9px] font-bold text-gray-400 uppercase mb-2">
              Selected Assessments
            </h3>
            <div className="space-y-2">
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