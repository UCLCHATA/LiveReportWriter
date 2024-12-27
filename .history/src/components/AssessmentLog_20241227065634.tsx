import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar, FileText, Activity, HelpCircle } from 'lucide-react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AssessmentLog.module.css';

interface ICFCategory {
  code: string;
  name: string;
}

interface ICFCategories {
  [key: string]: ICFCategory[];
}

interface Assessment {
  id: number;
  name: string;
  category: string;
  icfDomains: string[];
  module?: string;
  administrator?: string;
  date?: string;
  completedId?: number;
  completedDate?: string;
}

// Mock data for testing
const mockICFCategories: ICFCategories = {
  body_functions: [
    { code: 'b140', name: 'Attention functions' },
    { code: 'b144', name: 'Memory functions' },
    { code: 'b167', name: 'Mental functions of language' },
  ],
  activities_participation: [
    { code: 'd310', name: 'Communicating with - receiving - spoken messages' },
    { code: 'd315', name: 'Communicating with - receiving - nonverbal messages' },
    { code: 'd330', name: 'Speaking' },
  ],
  environmental_factors: [
    { code: 'e310', name: 'Immediate family' },
    { code: 'e355', name: 'Health professionals' },
    { code: 'e580', name: 'Health services, systems and policies' },
  ]
};

const mockAssessmentTools: { [key: string]: Assessment[] } = {
  all: [
    { id: 1, name: 'ADOS-2', category: 'core_diagnostic', icfDomains: ['b140', 'd310', 'd315'] },
    { id: 2, name: 'ADI-R', category: 'core_diagnostic', icfDomains: ['b167', 'd330', 'e310'] },
    { id: 3, name: 'Vineland-3', category: 'developmental', icfDomains: ['d310', 'd330', 'e580'] },
  ]
};

interface ICFDomainRadarProps {
  completedAssessments: Assessment[];
  icfCategories: ICFCategories;
}

// ICF Domain Visualization Component
const ICFDomainRadar: React.FC<ICFDomainRadarProps> = ({ completedAssessments, icfCategories }) => {
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
    <div className={styles.radarContainer}>
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

interface AssessmentTimelineProps {
  completedAssessments: Assessment[];
}

// Timeline Component
const AssessmentTimeline: React.FC<AssessmentTimelineProps> = ({ completedAssessments }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  useEffect(() => {
    if (timelineRef.current && completedAssessments.length > 0 && !timeline) {
      const items = completedAssessments.map(assessment => ({
        id: assessment.completedId,
        content: `
          <div class="${styles.timelineItem}">
            <div class="${styles.timelineItemTitle}">${assessment.name}</div>
            ${assessment.module ? `<div class="${styles.timelineItemDetail}">Module ${assessment.module}</div>` : ''}
            ${assessment.administrator ? `<div class="${styles.timelineItemDetail}">${assessment.administrator}</div>` : ''}
          </div>
        `,
        start: assessment.date || new Date(),
        type: 'box',
        className: `${styles.timelineItem}-${assessment.category}`
      }));

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

      const newTimeline = new Timeline(timelineRef.current, items, options);
      setTimeline(newTimeline);
    }

    return () => {
      if (timeline) {
        timeline.destroy();
        setTimeline(null);
      }
    };
  }, [completedAssessments, timeline]);

  return <div ref={timelineRef} className={styles.timelineContainer} />;
};

// Main Component
export const AssessmentLog: React.FC = () => {
  const [selectedAssessments, setSelectedAssessments] = useState<number[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<Assessment[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<'list' | 'timeline' | 'icf'>('list');

  const handleAssessmentComplete = (assessment: Assessment, details: Partial<Assessment>) => {
    const completedAssessment = {
      ...assessment,
      ...details,
      completedId: Date.now(),
      completedDate: new Date().toISOString()
    };

    setCompletedAssessments(prev => [...prev, completedAssessment]);
    setSelectedAssessments(prev => prev.filter(id => id !== assessment.id));
  };

  return (
    <div className={styles.logContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>Assessment Record</h3>
          <p>Track diagnostic pathway progress</p>
        </div>
        <div className={styles.headerControls}>
          {/* View Toggle Buttons */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => setView('list')}
              className={`${styles.viewButton} ${view === 'list' ? styles.viewButtonActive : ''}`}
            >
              <FileText className={styles.icon} />
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`${styles.viewButton} ${view === 'timeline' ? styles.viewButtonActive : ''}`}
            >
              <Calendar className={styles.icon} />
            </button>
            <button
              onClick={() => setView('icf')}
              className={`${styles.viewButton} ${view === 'icf' ? styles.viewButtonActive : ''}`}
            >
              <Activity className={styles.icon} />
            </button>
          </div>

          {/* Category Filter */}
          <div className={styles.categoryFilter}>
            <Filter className={styles.filterIcon} />
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className={styles.categorySelect}
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
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'list' && (
              <div className={styles.listView}>
                {/* Assessment Selection List */}
                <div className={styles.assessmentGrid}>
                  {mockAssessmentTools[activeCategory]?.map(assessment => (
                    <div key={assessment.id} className={styles.assessmentCard}>
                      <h4>{assessment.name}</h4>
                      <p>{assessment.category}</p>
                    </div>
                  ))}
                </div>

                {/* Completed Assessments Summary */}
                {completedAssessments.length > 0 && (
                  <div className={styles.completedAssessments}>
                    <h4>Completed Assessments</h4>
                    <div className={styles.completedGrid}>
                      {completedAssessments.map(assessment => (
                        <div key={assessment.completedId} className={styles.completedCard}>
                          <h5>{assessment.name}</h5>
                          <p>{new Date(assessment.completedDate || '').toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'timeline' && (
              <div className={styles.timelineView}>
                <AssessmentTimeline 
                  completedAssessments={completedAssessments}
                />
              </div>
            )}

            {view === 'icf' && (
              <div className={styles.icfView}>
                <ICFDomainRadar 
                  completedAssessments={completedAssessments}
                  icfCategories={mockICFCategories}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}; 