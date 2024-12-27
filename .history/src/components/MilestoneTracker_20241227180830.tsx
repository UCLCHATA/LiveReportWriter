import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  category: string;
  completed?: boolean;
}

const milestones = [
  { id: 'm1', title: 'Social Smile', category: 'social' },
  { id: 'm2', title: 'Eye Contact', category: 'social' },
  // ... other milestones
];

export const MilestoneTracker: React.FC = () => {
  const [completed, setCompleted] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4 p-4">
          {milestones.map(milestone => (
            <motion.div
              key={milestone.id}
              className={`
                p-4 rounded-lg cursor-pointer
                ${completed.includes(milestone.id) 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
                }
                shadow-sm hover:shadow-md
                transition-all duration-200
              `}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-sm font-medium">{milestone.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 