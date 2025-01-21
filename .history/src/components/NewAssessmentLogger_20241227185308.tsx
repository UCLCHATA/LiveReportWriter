import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
}

const assessments = [
  { id: 'ados2', name: 'ADOS-2' },
  { id: '3di', name: '3Di' },
  { id: 'adir', name: 'ADI-R' },
  { id: 'vineland3', name: 'Vineland-3' },
  { id: 'bayley4', name: 'Bayley-4' },
  { id: 'qbtest', name: 'QbTest' },
  { id: 'conners3', name: 'Conners-3' },
  { id: 'celf5', name: 'CELF-5' },
  { id: 'pls5', name: 'PLS-5' }
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

  return (
    <div className="p-6">
      {/* Assessment Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {assessments.map(assessment => (
            <motion.button
              key={assessment.id}
              className={`
                min-w-[120px] px-6 py-3
                rounded-lg
                text-sm font-medium
                border-2 shadow-sm
                ${selectedAssessments.some(a => a.id === assessment.id)
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleAssessment(assessment)}
            >
              {assessment.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Assessments */}
      {selectedAssessments.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Selected Assessments</h2>
          <div className="space-y-4">
            {selectedAssessments.map(assessment => (
              <div 
                key={assessment.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
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
                  onChange={(e) => setSelectedAssessments(prev =>
                    prev.map(a => a.id === assessment.id 
                      ? { ...a, notes: e.target.value }
                      : a
                    )
                  )}
                  placeholder="Add assessment details, scores, and observations..."
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssessmentLogger; 