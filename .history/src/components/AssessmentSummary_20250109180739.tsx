import React from 'react';
import { motion } from 'framer-motion';
import styles from './AssessmentSummary.module.css';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import { MilestoneTracker } from './MilestoneTracker';
import type { AssessmentData, Assessment } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
  onChange: (data: any) => void;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data, onChange }) => {
  const renderAssessmentLog = (assessment: Assessment) => {
    return (
      <div key={assessment.id} className={styles.logEntry}>
        <div className={styles.logHeader}>
          <div className={styles.logTitle}>
            <div 
              className={styles.logColor}
              style={{ backgroundColor: assessment.color }}
            />
            <span className={styles.logName}>{assessment.name}</span>
            <span className={styles.logCategory}>{assessment.category}</span>
          </div>
          <div className={styles.logDate}>{assessment.date}</div>
        </div>
        {assessment.notes && (
          <div className={styles.logNotes}>{assessment.notes}</div>
        )}
      </div>
    );
  };

  // Only show sections that have data
  const showSensoryData = data.sensoryProfile?.domains && Object.keys(data.sensoryProfile.domains).length > 0;
  const showSocialData = data.socialCommunication?.domains && Object.keys(data.socialCommunication.domains).length > 0;
  const showBehaviorData = data.behaviorInterests?.domains && Object.keys(data.behaviorInterests.domains).length > 0;
  const showMilestones = data.milestones?.milestones && data.milestones.milestones.length > 0;
  const showAssessmentLogs = data.assessmentLog?.selectedAssessments && data.assessmentLog.selectedAssessments.length > 0;

  const hasAnyData = showSensoryData || showSocialData || showBehaviorData || showMilestones || showAssessmentLogs;

  const updateSummaryData = (newData: any) => {
    onChange({
      ...data,
      ...newData,
      type: 'summary',
      lastUpdated: new Date().toISOString()
    });
  };

  return (
    <div className={styles.container}>
      {/* Combined Radar Graph Section */}
      {(showSensoryData || showSocialData || showBehaviorData) && (
        <motion.section 
          className={styles.graphSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Combined Assessment Profile</h3>
          <div className={styles.combinedGraph}>
            <CombinedRadarGraph
              sensoryData={data.sensoryProfile}
              socialData={data.socialCommunication}
              behaviorData={data.behaviorInterests}
            />
          </div>
        </motion.section>
      )}

      {/* Milestone Timeline Section */}
      {showMilestones && (
        <motion.section 
          className={styles.timelineSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3>Developmental Timeline</h3>
          <div className={styles.timeline}>
            <MilestoneTracker 
              data={data.milestones}
              onChange={() => {}} // Read-only view
            />
          </div>
        </motion.section>
      )}

      {/* Assessment Logs Section */}
      {showAssessmentLogs && (
        <motion.section 
          className={styles.logsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3>Assessment History</h3>
          <div className={styles.assessmentLogs}>
            {data.assessmentLog?.selectedAssessments?.map(assessment => {
              const entryData = data.assessmentLog?.entries?.[assessment.id];
              if (!entryData) return null;
              
              const logData: Assessment = {
                id: assessment.id,
                name: assessment.name,
                color: entryData.color,
                category: entryData.category,
                date: entryData.date,
                notes: entryData.notes,
                status: entryData.status,
                addedAt: entryData.addedAt,
                lastModified: entryData.lastModified
              };
              
              return renderAssessmentLog(logData);
            })}
          </div>
        </motion.section>
      )}

      {/* Show message if no data available */}
      {!hasAnyData && (
        <motion.div 
          className={styles.noData}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>No assessment data available yet. Complete other sections to see the summary.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentSummary; 