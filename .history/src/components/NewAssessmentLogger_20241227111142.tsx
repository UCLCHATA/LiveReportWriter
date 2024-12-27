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
      {/* Assessment Selection Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {assessments.map(assessment => (
          <motion.div
            key={assessment.id}
            className={`
              p-6 rounded-xl cursor-pointer
              ${selectedAssessments.some(a => a.id === assessment.id)
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }
              transition-all duration-200
            `}
            onClick={() => handleToggleAssessment(assessment)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-base font-medium">{assessment.name}</h3>
          </motion.div>
        ))}
      </div>

      {/* Selected Assessments */}
      <AnimatePresence>
        {selectedAssessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Selected Assessments
            </h2>
            <div className="space-y-4">
              {selectedAssessments.map(assessment => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {assessment.name}
                      </h3>
                      <input
                        type="date"
                        value={assessment.date || ''}
                        onChange={(e) => handleUpdateAssessment(assessment.id, { date: e.target.value })}
                        className="text-sm border rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleToggleAssessment(assessment)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <input
                      type="text"
                      value={assessment.notes || ''}
                      onChange={(e) => handleUpdateAssessment(assessment.id, { notes: e.target.value })}
                      placeholder="Add assessment details, scores, and observations..."
                      className="w-full text-sm bg-white border rounded-md px-3 py-2 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewAssessmentLogger; 