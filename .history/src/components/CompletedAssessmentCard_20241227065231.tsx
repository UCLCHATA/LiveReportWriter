import React from 'react';
import { Card } from './ui/card';
import { Calendar, User } from 'lucide-react';

interface CompletedAssessment {
  id: string;
  name: string;
  category: string;
  module?: string;
  administrator?: string;
  icfDomains: string[];
  date: string;
  completedId: number;
  completedDate: string;
}

interface Props {
  assessment: CompletedAssessment;
}

export const CompletedAssessmentCard: React.FC<Props> = ({ assessment }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{assessment.name}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryStyle(assessment.category)}`}>
            {assessment.category.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(assessment.completedDate)}
          </div>
          {assessment.administrator && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {assessment.administrator}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const getCategoryStyle = (category: string): string => {
  const styles = {
    core_diagnostic: 'bg-blue-100 text-blue-800',
    developmental: 'bg-green-100 text-green-800',
    cognitive_attention: 'bg-purple-100 text-purple-800',
    language_communication: 'bg-yellow-100 text-yellow-800',
    questionnaires: 'bg-gray-100 text-gray-800'
  };
  
  return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
}; 