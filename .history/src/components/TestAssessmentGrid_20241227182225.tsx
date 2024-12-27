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
    <div className="w-full h-full">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {assessments.map(assessment => (
          <motion.button
            key={assessment.id}
            className={`
              w-full aspect-[4/3]
              flex items-center justify-center
              rounded-lg text-center p-4
              ${selected.includes(assessment.id)
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
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
            <span className="font-medium">{assessment.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}; 