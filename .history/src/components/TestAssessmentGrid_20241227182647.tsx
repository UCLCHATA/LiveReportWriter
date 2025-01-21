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
    <div className="w-full min-h-full bg-white">
      <div className="flex flex-wrap gap-4 p-4">
        {assessments.map(assessment => (
          <div key={assessment.id} className="w-[calc(25%-16px)]">
            <motion.button
              className={`
                w-full py-3 px-4
                rounded-lg
                border-2
                ${selected.includes(assessment.id)
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }
                transition-colors duration-200
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(prev =>
                  prev.includes(assessment.id)
                    ? prev.filter(id => id !== assessment.id)
                    : [...prev, assessment.id]
                );
              }}
            >
              {assessment.name}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}; 