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
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4">
        {assessments.map(assessment => (
          <motion.div
            key={assessment.id}
            className={`
              p-4 border rounded-lg cursor-pointer
              ${selected.includes(assessment.id)
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-50'
              }
            `}
            onClick={() => {
              setSelected(prev =>
                prev.includes(assessment.id)
                  ? prev.filter(id => id !== assessment.id)
                  : [...prev, assessment.id]
              );
            }}
          >
            {assessment.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 