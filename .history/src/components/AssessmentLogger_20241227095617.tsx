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
      rounded-full px-4 py-2 cursor-pointer
      transition-colors duration-200
      ${isSelected ? 'text-white' : 'text-gray-700 bg-gray-100'}
    `}
    style={{
      backgroundColor: isSelected ? assessment.color : undefined
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: assessment.color }}
        />
        <h3 className="font-medium">{assessment.name}</h3>
      </div>
      <button
        onClick={() => onRemove(assessment.id)}
        className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 p-1"
      >
        <X size={16} />
      </button>
    </div>
    
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-2 min-w-[200px]">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          value={assessment.date || ''}
          onChange={(e) => onUpdate(assessment.id, { date: e.target.value })}
          className="text-sm border rounded px-2 py-1 bg-white flex-1"
        />
      </div>
      <div className="flex-1 min-w-[300px]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-400" />
          <input
            type="text"
            value={assessment.notes || ''}
            onChange={(e) => onUpdate(assessment.id, { notes: e.target.value })}
            placeholder="Add key observations..."
            className="text-sm border rounded px-2 py-1 w-full bg-white"
          />
        </div>
      </div>
    </div>
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
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Assessment Log</h2>
        
        {/* Assessment Bubbles - now grouped by category */}
        <div className="space-y-6">
          {Object.entries(assessmentTools).map(([category, tools]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 capitalize">
                {category.replace('_', ' ')}
              </h3>
              <div className="flex flex-wrap gap-2">
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
        <div className="mt-8 space-y-4">
          {selectedAssessments.length > 0 && (
            <h3 className="text-sm font-medium text-gray-500">Selected Assessments</h3>
          )}
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
    </div>
  );
};

export default AssessmentLogger; 