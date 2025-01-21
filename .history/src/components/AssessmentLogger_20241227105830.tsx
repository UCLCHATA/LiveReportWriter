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

const assessmentList = [
  { id: 'ados2', name: 'ADOS-2', category: 'core_diagnostic' },
  { id: '3di', name: '3Di', category: 'core_diagnostic' },
  { id: 'adir', name: 'ADI-R', category: 'core_diagnostic' },
  { id: 'vineland3', name: 'Vineland-3', category: 'developmental' },
  { id: 'bayley4', name: 'Bayley-4', category: 'developmental' },
  { id: 'qbtest', name: 'QbTest', category: 'cognitive_attention' },
  { id: 'conners3', name: 'Conners-3', category: 'cognitive_attention' },
  { id: 'celf5', name: 'CELF-5', category: 'language_communication' },
  { id: 'pls5', name: 'PLS-5', category: 'language_communication' }
];

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
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-4">
        {/* Assessment Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          {assessmentList.map(assessment => (
            <div 
              key={assessment.id}
              className={`
                p-2.5 rounded-lg border cursor-pointer
                transition-colors duration-200
                ${selectedAssessments.some(a => a.id === assessment.id)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
              onClick={() => handleToggleAssessment(assessment)}
            >
              <span className="text-sm font-medium">
                {assessment.name}
              </span>
            </div>
          ))}
        </div>

        {/* Selected Assessments */}
        {selectedAssessments.length > 0 && (
          <div className="mt-6 space-y-3">
            {selectedAssessments.map(assessment => (
              <div key={assessment.id} className="bg-white rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{assessment.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={assessment.date || ''}
                      onChange={(e) => handleUpdateAssessment(assessment.id, { date: e.target.value })}
                      className="text-sm border rounded px-2 py-1"
                    />
                    <button onClick={() => handleRemoveAssessment(assessment.id)}>
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={assessment.notes || ''}
                  onChange={(e) => handleUpdateAssessment(assessment.id, { notes: e.target.value })}
                  placeholder="Add assessment details..."
                  className="mt-2 w-full text-sm border rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentLogger; 