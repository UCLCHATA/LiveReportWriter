import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Assessment {
  id: string;
  name: string;
}

const assessments = [
  { id: 'ados2', name: 'ADOS-2' },
  { id: '3di', name: '3Di' },
  { id: 'adir', name: 'ADI-R' },
  // ... others
];

export const TestAssessmentGrid: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4">
          {assessments.map(assessment => (
            <motion.div
              key={assessment.id}
              className={`
                p-4 rounded-lg cursor-pointer
                ${selected.includes(assessment.id) 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
                }
                shadow-sm hover:shadow-md
                transition-all duration-200
              `}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelected(prev => 
                  prev.includes(assessment.id)
                    ? prev.filter(id => id !== assessment.id)
                    : [...prev, assessment.id]
                );
              }}
            >
              <h3 className="text-sm font-medium">{assessment.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 