import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  category: string;
  date?: string;
  notes?: string;
}

// Group assessments by category for grid layout
const assessmentsByCategory = {
  core_diagnostic: [
    { id: 'ados2', name: 'ADOS-2' },
    { id: '3di', name: '3Di' },
    { id: 'adir', name: 'ADI-R' }
  ],
  developmental: [
    { id: 'vineland3', name: 'Vineland-3' },
    { id: 'bayley4', name: 'Bayley-4' }
  ],
  cognitive_attention: [
    { id: 'qbtest', name: 'QbTest' },
    { id: 'conners3', name: 'Conners-3' }
  ],
  language_communication: [
    { id: 'celf5', name: 'CELF-5' },
    { id: 'pls5', name: 'PLS-5' }
  ]
};

export const NewAssessmentLogger: React.FC = () => {
  const [selectedAssessments, setSelectedAssessments] = useState<Assessment[]>([]);

  const handleToggleAssessment = (assessment: Assessment) => {
    setSelectedAssessments(prev => 
      prev.some(a => a.id === assessment.id)
        ? prev.filter(a => a.id !== assessment.id)
        : [...prev, { ...assessment, date: '', notes: '' }]
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      {/* Assessment Selection Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-6 mb-8">
        {Object.entries(assessmentsByCategory).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">
              {category.replace('_', ' ')}
            </h3>
            <div className="space-y-2">
              {items.map(assessment => (
                <div
                  key={assessment.id}
                  onClick={() => handleToggleAssessment(assessment)}
                  className={`
                    group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer
                    border border-gray-200 hover:bg-gray-50 transition-colors
                    ${selectedAssessments.some(a => a.id === assessment.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : ''
                    }
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded border flex items-center justify-center
                    ${selectedAssessments.some(a => a.id === assessment.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-gray-400'
                    }
                  `}>
                    {selectedAssessments.some(a => a.id === assessment.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm">{assessment.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Assessments */}
      {selectedAssessments.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-base font-semibold mb-4">Selected Assessments</h2>
          <div className="space-y-4">
            {selectedAssessments.map(assessment => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{assessment.name}</span>
                    <input
                      type="date"
                      value={assessment.date || ''}
                      onChange={(e) => setSelectedAssessments(prev =>
                        prev.map(a => a.id === assessment.id 
                          ? { ...a, date: e.target.value }
                          : a
                        )
                      )}
                      className="border rounded px-2 py-1 text-sm bg-white"
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
                  onChange={(e) => setSelectedAssessments(prev =>
                    prev.map(a => a.id === assessment.id 
                      ? { ...a, notes: e.target.value }
                      : a
                    )
                  )}
                  placeholder="Add assessment details, scores, and observations..."
                  className="w-full border rounded p-2 text-sm bg-white"
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