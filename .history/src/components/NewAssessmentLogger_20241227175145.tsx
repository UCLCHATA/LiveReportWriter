import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  date?: string;
  notes?: string;
}

// Flat array maintaining category order
const assessments = [
  // Core Diagnostic
  { id: 'ados2', name: 'ADOS-2' },
  { id: '3di', name: '3Di' },
  { id: 'adir', name: 'ADI-R' },
  // Developmental
  { id: 'vineland3', name: 'Vineland-3' },
  { id: 'bayley4', name: 'Bayley-4' },
  // Cognitive Attention
  { id: 'qbtest', name: 'QbTest' },
  { id: 'conners3', name: 'Conners-3' },
  // Language Communication
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
    <div className="w-full bg-white rounded-lg shadow-sm">
      {/* Assessment Grid - Matching MilestoneTracker styling */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {assessments.map(assessment => (
            <motion.div
              key={assessment.id}
              onClick={() => handleToggleAssessment(assessment)}
              className={`
                p-4 rounded-lg cursor-pointer
                border transition-all duration-200
                ${selectedAssessments.some(a => a.id === assessment.id)
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 hover:shadow-md'
                }
              `}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium">
                {assessment.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Assessments Section */}
      {selectedAssessments.length > 0 && (
        <div className="border-t">
          <div className="p-6">
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
        </div>
      )}
    </div>
  );
};

export default NewAssessmentLogger; 