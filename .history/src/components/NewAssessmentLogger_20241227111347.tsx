import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  category: string;
  date?: string;
  notes?: string;
}

const assessments = [
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

export const NewAssessmentLogger: React.FC = () => {
  const [selectedAssessments, setSelectedAssessments] = useState<Assessment[]>([]);

  const handleToggleAssessment = (assessment: Assessment) => {
    setSelectedAssessments(prev => 
      prev.some(a => a.id === assessment.id)
        ? prev.filter(a => a.id !== assessment.id)
        : [...prev, { ...assessment, date: '', notes: '' }]
    );
  };

  const handleUpdateAssessment = (id: string, updates: Partial<Assessment>) => {
    setSelectedAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      {/* Simple Vertical Assessment List */}
      <div className="space-y-2 mb-8">
        {assessments.map(assessment => (
          <motion.div
            key={assessment.id}
            className={`
              p-3 rounded-lg cursor-pointer
              ${selectedAssessments.some(a => a.id === assessment.id)
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'hover:bg-gray-50 border border-gray-200'
              }
              transition-colors duration-200
            `}
            onClick={() => handleToggleAssessment(assessment)}
          >
            <h3 className="text-sm font-medium text-gray-900">
              {assessment.name}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Selected Assessments */}
      {selectedAssessments.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-base font-semibold mb-4">
            Selected Assessments
          </h2>
          <div className="space-y-4">
            {selectedAssessments.map(assessment => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{assessment.name}</span>
                    <input
                      type="date"
                      value={assessment.date || ''}
                      onChange={(e) => handleUpdateAssessment(assessment.id, { date: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleToggleAssessment(assessment)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={assessment.notes || ''}
                  onChange={(e) => handleUpdateAssessment(assessment.id, { notes: e.target.value })}
                  placeholder="Add assessment details, scores, and observations..."
                  className="w-full border rounded p-2 text-sm"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssessmentLogger; 