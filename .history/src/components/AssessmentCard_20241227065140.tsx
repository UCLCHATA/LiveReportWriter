import React from 'react';
import { Card } from './ui/card';
import { Check, ChevronRight } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  category: string;
  module?: string;
  administrator?: string;
  icfDomains: string[];
  date: string;
}

interface Props {
  assessment: Assessment;
  selected: boolean;
  onSelect: () => void;
  onComplete: (assessment: Assessment, details: Partial<Assessment>) => void;
}

export const AssessmentCard: React.FC<Props> = ({
  assessment,
  selected,
  onSelect,
  onComplete
}) => {
  return (
    <Card className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
      onClick={onSelect}>
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{assessment.name}</h4>
          {assessment.module && (
            <p className="text-sm text-gray-500">Module {assessment.module}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(assessment, {
                  date: new Date().toISOString(),
                  administrator: 'Current User' // This should be dynamic based on the logged-in user
                });
              }}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </Card>
  );
}; 