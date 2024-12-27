import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, FileText, Activity } from 'lucide-react';

interface ICFCategory {
  code: string;
  name: string;
  description: string;
}

interface ICFCategories {
  [key: string]: ICFCategory[];
}

interface Assessment {
  id: string;
  name: string;
  category: string;
  module?: string;
  administrator?: string;
  icfDomains: string[];
  date: string;
}

interface CompletedAssessment extends Assessment {
  completedId: number;
  completedDate: string;
}

interface AssessmentTools {
  [key: string]: Assessment[];
}

interface Props {
  onAssessmentComplete?: (assessment: CompletedAssessment) => void;
  icfCategories: ICFCategories;
  assessmentTools: AssessmentTools;
}

// ICF Domain Visualization Component
const ICFDomainRadar: React.FC<{ completedAssessments: CompletedAssessment[]; icfCategories: ICFCategories }> = ({ 
  completedAssessments, 
  icfCategories 
}) => {
  const calculateDomainCoverage = () => {
    const domains = Object.keys(icfCategories);
    return domains.map(domain => {
      const totalCodes = icfCategories[domain].length;
      const coveredCodes = icfCategories[domain].filter(category =>
        completedAssessments.some(assessment => 
          assessment.icfDomains.includes(category.code)
        )
      ).length;
      return {
        domain: domain.replace('_', ' '),
        coverage: (coveredCodes / totalCodes) * 100,
        total: totalCodes,
        covered: coveredCodes
      };
    });
  };

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={calculateDomainCoverage()}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" />
          <Radar
            name="ICF Coverage"
            dataKey="coverage"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Timeline Component with Enhanced Interaction
const AssessmentTimeline: React.FC<{ completedAssessments: CompletedAssessment[] }> = ({ completedAssessments }) => {
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<Timeline | null>(null);

  useEffect(() => {
    if (timelineRef.current && completedAssessments.length > 0) {
      const items = new DataSet(completedAssessments.map(assessment => ({
        id: assessment.completedId,
        content: `
          <div class="timeline-item p-2">
            <div class="font-medium">${assessment.name}</div>
            ${assessment.module ? `<div class="text-xs">Module ${assessment.module}</div>` : ''}
            ${assessment.administrator ? `<div class="text-xs">${assessment.administrator}</div>` : ''}
          </div>
        `,
        start: new Date(assessment.date),
        type: 'box',
        className: `timeline-item-${assessment.category}`
      })));

      const options = {
        height: '200px',
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        zoomable: true,
        stack: false,
        verticalScroll: true,
        horizontalScroll: true,
        tooltip: {
          followMouse: true,
          overflowMethod: 'cap'
        }
      };

      const timeline = new Timeline(timelineRef.current, items, options);
      setInstance(timeline);

      return () => {
        if (instance) {
          instance.destroy();
        }
      };
    }
  }, [completedAssessments]);

  return <div ref={timelineRef} className="timeline-container border rounded-lg p-4" />;
};

// Main Component
const AssessmentLogger: React.FC<Props> = ({ onAssessmentComplete, icfCategories, assessmentTools }) => {
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [view, setView] = useState<'list' | 'timeline' | 'icf'>('list');

  const handleAssessmentComplete = (assessment: Assessment, details: Partial<Assessment>) => {
    const completedAssessment: CompletedAssessment = {
      ...assessment,
      ...details,
      completedId: Date.now(),
      completedDate: new Date().toISOString()
    };

    setCompletedAssessments(prev => [...prev, completedAssessment]);
    setSelectedAssessments(prev => prev.filter(id => id !== assessment.id));
    
    if (onAssessmentComplete) {
      onAssessmentComplete(completedAssessment);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="font-bold text-lg">Assessment Record</h3>
          <p className="text-sm text-gray-500">Track diagnostic pathway progress</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle Buttons */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`p-2 text-sm ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`p-2 text-sm ${view === 'timeline' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('icf')}
              className={`p-2 text-sm ${view === 'icf' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="text-sm border rounded p-1"
            >
              <option value="all">All Assessments</option>
              <option value="core_diagnostic">Core Diagnostic</option>
              <option value="developmental">Developmental</option>
              <option value="cognitive_attention">Cognitive & Attention</option>
              <option value="language_communication">Language & Communication</option>
              <option value="questionnaires">Questionnaires</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'list' && (
              <div className="space-y-4">
                {/* Assessment Selection List */}
                <div className="grid gap-4">
                  {assessmentTools[activeCategory]?.map(assessment => (
                    <AssessmentCard 
                      key={assessment.id}
                      assessment={assessment}
                      onComplete={handleAssessmentComplete}
                      selected={selectedAssessments.includes(assessment.id)}
                      onSelect={() => handleAssessmentSelect(assessment)}
                    />
                  ))}
                </div>

                {/* Completed Assessments Summary */}
                {completedAssessments.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Completed Assessments</h4>
                    <div className="space-y-2">
                      {completedAssessments.map(assessment => (
                        <CompletedAssessmentCard 
                          key={assessment.completedId}
                          assessment={assessment}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'timeline' && (
              <div className="space-y-4">
                <AssessmentTimeline 
                  completedAssessments={completedAssessments}
                />
              </div>
            )}

            {view === 'icf' && (
              <div className="space-y-4">
                <ICFDomainRadar 
                  completedAssessments={completedAssessments}
                  icfCategories={icfCategories}
                />
                <ICFCoverageList 
                  completedAssessments={completedAssessments}
                  icfCategories={icfCategories}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AssessmentLogger; 