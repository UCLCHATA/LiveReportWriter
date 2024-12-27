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
  { id: 'vineland3', name: 'Vineland-3' },
  { id: 'bayley4', name: 'Bayley-4' },
  { id: 'qbtest', name: 'QbTest' },
  { id: 'conners3', name: 'Conners-3' },
  { id: 'celf5', name: 'CELF-5' },
  { id: 'pls5', name: 'PLS-5' }
];

export const TestAssessmentGrid: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-6">
          {assessments.map(assessment => (
            <motion.div
              key={assessment.id}
              className={`
                p-6 rounded-xl cursor-pointer
                ${selected.includes(assessment.id)
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }
                transform transition-all duration-200
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(prev =>
                  prev.includes(assessment.id)
                    ? prev.filter(id => id !== assessment.id)
                    : [...prev, assessment.id]
                );
              }}
            >
              <div className="text-base font-medium">
                {assessment.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 