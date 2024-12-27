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
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3">
        {assessments.map(assessment => (
          <motion.button
            key={assessment.id}
            className={`
              px-4 py-2
              rounded-full
              shadow-sm
              text-sm font-medium
              whitespace-nowrap
              ${selected.includes(assessment.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
        ))}
      </div>
    </div>
  );
}; 