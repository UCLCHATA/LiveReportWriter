import React from 'react';
import { motion } from 'framer-motion';
import styles from './AssessmentSummary.module.css';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import { MilestoneTracker } from './MilestoneTracker';
import type { AssessmentData, Assessment } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data }) => {
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

  return (
    <div className={styles.container}>
      {/* Combined Radar Graph Section */}
      <section className={styles.graphSection}>
        <h3>Combined Assessment Profile</h3>
        <div className={styles.combinedGraph}>
          <CombinedRadarGraph
            sensoryData={data.sensoryProfile}
            socialData={data.socialCommunication}
            behaviorData={data.behaviorInterests}
          />
        </div>
      </section>

      {/* Milestone Timeline Section */}
      <section className={styles.timelineSection}>
        <h3>Developmental Timeline</h3>
        <div className={styles.timeline}>
          <MilestoneTracker 
            data={data.milestones}
            onChange={() => {}} // Read-only view
          />
        </div>
      </section>

      {/* Assessment Logs Section */}
      <section className={styles.logsSection}>
        <h3>Assessment History</h3>
        <div className={styles.assessmentLogs}>
          {data.assessmentLog?.selectedAssessments?.map(assessment => 
            renderAssessmentLog({
              ...assessment,
              ...data.assessmentLog?.entries?.[assessment.id]
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default AssessmentSummary; 