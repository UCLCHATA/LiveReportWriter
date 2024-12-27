import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, MessageSquare } from 'lucide-react';

// Assessment tools data with proper categorization
const assessmentTools = {
  core_diagnostic: [
    { id: 'ados2', name: 'ADOS-2', color: '#4299E1', timeNeeded: '40-60min' },
    { id: '3di', name: '3Di', color: '#48BB78', timeNeeded: '90min' },
    { id: 'adir', name: 'ADI-R', color: '#ED8936', timeNeeded: '120-180min' }
  ],
  developmental: [
    { id: 'vineland3', name: 'Vineland-3', color: '#9F7AEA', timeNeeded: '45-60min' },
    { id: 'bayley4', name: 'Bayley-4', color: '#F687B3', timeNeeded: '60-90min' }
  ],
  cognitive_attention: [
    { id: 'qbtest', name: 'QbTest', color: '#4FD1C5', timeNeeded: '15-20min' },
    { id: 'conners3', name: 'Conners-3', color: '#F6AD55', timeNeeded: '20min' }
  ],
  language_communication: [
    { id: 'celf5', name: 'CELF-5', color: '#667EEA', timeNeeded: '30-60min' },
    { id: 'pls5', name: 'PLS-5', color: '#FC8181', timeNeeded: '45-60min' }
  ]
};

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  color: string;
  timeNeeded?: string;
}

// First, flatten our assessments into a single array with category info
const allAssessments = Object.entries(assessmentTools).flatMap(([category, tools]) => 
  tools.map(tool => ({ ...tool, category }))
);

const AssessmentBubble: React.FC<{
  assessment: Assessment;
  isSelected: boolean;
  onClick: () => void;
}> = ({ assessment, isSelected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`
      py-2.5 px-5
      text-[11px] font-medium
      rounded-full
      transition-all duration-200
      shadow-md
      m-1.5
      ${isSelected 
        ? `
          bg-gradient-to-br from-white via-white to-${assessment.color}/20
          border-2 border-${assessment.color}/50
          text-${assessment.color}
          shadow-lg shadow-${assessment.color}/20
        ` 
        : `
          bg-gradient-to-br from-white via-gray-50 to-gray-100
          border border-gray-100
          hover:shadow-lg hover:from-white hover:to-gray-50
          hover:border-gray-200
        `
      }
      transform hover:-translate-y-1
    `}
    style={{
      background: isSelected 
        ? `linear-gradient(135deg, white, white, ${assessment.color}20)`
        : 'linear-gradient(135deg, white, #f9fafb, #f3f4f6)',
      borderColor: isSelected ? assessment.color : undefined,
      color: isSelected ? assessment.color : '#374151',
      boxShadow: isSelected 
        ? `0 4px 12px ${assessment.color}20`
        : '0 2px 6px rgba(0,0,0,0.05)'
    }}
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
    className="flex items-center gap-3 bg-white border rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
  >
    <div
      className="w-1 h-6 rounded-full"
      style={{ backgroundColor: assessment.color }}
    />
    <div className="font-medium text-[11px] min-w-[80px]">{assessment.name}</div>
    <input
      type="date"
      value={assessment.date || ''}
      onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
      className="text-[11px] border rounded px-2 py-1 w-28 focus:ring-1 focus:ring-blue-200 outline-none"
    />
    <input
      type="text"
      value={assessment.notes || ''}
      onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
      placeholder="Add key observations..."
      className="text-[11px] border rounded px-2 py-1 flex-1 min-w-[150px] focus:ring-1 focus:ring-blue-200 outline-none"
    />
    <button
      onClick={() => onRemove(assessment.id)}
      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
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
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-6">
        {/* Assessment selection area */}
        <div className="min-h-[220px] mb-6">
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-xl">
            {allAssessments.map(assessment => (
              <AssessmentBubble
                key={assessment.id}
                assessment={assessment}
                isSelected={selectedAssessments.some(a => a.id === assessment.id)}
                onClick={() => handleToggleAssessment(assessment)}
              />
            ))}
          </div>
        </div>

        {/* Selected assessments section */}
        {selectedAssessments.length > 0 && (
          <div className="overflow-auto">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Selected Assessments
            </h3>
            <div className="space-y-2.5 bg-gray-50/50 p-3 rounded-xl">
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