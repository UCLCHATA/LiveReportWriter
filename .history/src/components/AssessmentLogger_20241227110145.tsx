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
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Assessment Log</h2>
        </div>

        {/* Assessment Grid - Milestone style */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {assessmentList.map(assessment => (
            <div 
              key={assessment.id}
              onClick={() => handleToggleAssessment(assessment)}
              className={`
                p-4 rounded-xl cursor-pointer
                transition-all duration-200
                transform hover:scale-105
                ${selectedAssessments.some(a => a.id === assessment.id)
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                }
              `}
            >
              <div className="text-sm font-medium">
                {assessment.name}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Assessments - Form section style */}
        {selectedAssessments.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Selected Assessments
            </h3>
            <div className="space-y-4">
              {selectedAssessments.map(assessment => (
                <div 
                  key={assessment.id} 
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <h4 className="text-sm font-medium text-gray-700">{assessment.name}</h4>
                      <input
                        type="date"
                        value={assessment.date || ''}
                        onChange={(e) => handleUpdateAssessment(assessment.id, { date: e.target.value })}
                        className="text-sm border rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveAssessment(assessment.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Assessment Details Section */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <input
                      type="text"
                      value={assessment.notes || ''}
                      onChange={(e) => handleUpdateAssessment(assessment.id, { notes: e.target.value })}
                      placeholder="Add assessment details, scores, and observations..."
                      className="w-full text-sm bg-white border rounded-md px-3 py-2 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentLogger; 