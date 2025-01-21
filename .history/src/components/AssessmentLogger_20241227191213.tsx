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
      py-2 px-4
      text-[11px] font-medium
      rounded-full
      transition-all duration-200
      shadow-sm
      ${isSelected 
        ? `bg-gradient-to-b from-white to-${assessment.color}/10
           border-2 border-${assessment.color} 
           text-${assessment.color} shadow-${assessment.color}/20` 
        : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200 hover:from-gray-50 hover:to-white'
      }
      transform hover:-translate-y-0.5
    `}
    style={{
      // Fallback styles in case Tailwind classes don't work as expected
      background: isSelected 
        ? `linear-gradient(to bottom, white, ${assessment.color}10)`
        : 'linear-gradient(to bottom, white, #f9fafb)',
      borderColor: isSelected ? assessment.color : undefined,
      color: isSelected ? assessment.color : '#374151'
    }}
    whileHover={{ scale: 1.05 }}
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
    className="flex items-center gap-1.5 bg-white border rounded-lg p-1.5"
  >
    <div
      className="w-0.5 h-5 rounded-full"
      style={{ backgroundColor: assessment.color }}
    />
    <div className="font-medium text-[10px] min-w-[70px]">{assessment.name}</div>
    <input
      type="date"
      value={assessment.date || ''}
      onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
      className="text-[10px] border rounded px-1.5 py-0.5 w-24"
    />
    <input
      type="text"
      value={assessment.notes || ''}
      onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
      placeholder="Add key observations..."
      className="text-[10px] border rounded px-1.5 py-0.5 flex-1 min-w-[150px]"
    />
    <button
      onClick={() => onRemove(assessment.id)}
      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
    >
      <X size={10} />
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
      <div className="p-4">
        {/* Assessment selection area */}
        <div className="h-[200px] mb-4"> {/* Increased height */}
          <div className="grid grid-cols-3 gap-3 p-2"> {/* Changed to 3 columns, increased gap */}
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

        {/* Scrollable selected assessments section */}
        {selectedAssessments.length > 0 && (
          <div className="overflow-auto">
            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Selected Assessments
            </h3>
            <div className="space-y-1">
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