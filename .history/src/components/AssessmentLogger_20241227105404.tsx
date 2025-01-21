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
      px-4 py-2
      w-auto inline-flex items-center justify-center
      rounded-full text-[11px] font-medium
      ${isSelected 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
      }
      transform transition-all duration-200
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
    className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <h4 className="font-medium text-sm">{assessment.name}</h4>
        <input
          type="date"
          value={assessment.date || ''}
          onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
          className="text-xs border rounded px-2 py-1"
        />
      </div>
      <button
        onClick={() => onRemove(assessment.id)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
      >
        <X size={14} />
      </button>
    </div>
    
    <textarea
      value={assessment.notes || ''}
      onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
      placeholder="Enter assessment scores, observations, and key findings..."
      className="w-full text-sm border rounded p-2 min-h-[60px] resize-none"
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
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col h-full">
      <div className="p-6">
        {/* Single grid for all assessment bubbles */}
        <div className="grid grid-cols-4 auto-rows-auto gap-6 p-4 max-h-[200px] overflow-y-auto">
          {Object.values(assessmentTools).flat().map(tool => (
            <div key={tool.id} className="flex justify-center">
              <AssessmentBubble
                assessment={tool}
                isSelected={selectedAssessments.some(a => a.id === tool.id)}
                onClick={() => handleToggleAssessment(tool)}
              />
            </div>
          ))}
        </div>

        {/* Selected Assessments */}
        {selectedAssessments.length > 0 && (
          <div className="border-t mt-6 pt-4">
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