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

  // Only show sections that have data
  const showSensoryData = data.sensoryProfile?.domains && Object.keys(data.sensoryProfile.domains).length > 0;
  const showSocialData = data.socialCommunication?.domains && Object.keys(data.socialCommunication.domains).length > 0;
  const showBehaviorData = data.behaviorInterests?.domains && Object.keys(data.behaviorInterests.domains).length > 0;
  const showMilestones = data.milestones?.milestones && data.milestones.milestones.length > 0;
  const showAssessmentLogs = data.assessmentLog?.selectedAssessments && data.assessmentLog.selectedAssessments.length > 0;

  return (
    <div className={styles.container}>
      {/* Combined Radar Graph Section */}
      {(showSensoryData || showSocialData || showBehaviorData) && (
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
      )}

      {/* Milestone Timeline Section */}
      {showMilestones && (
        <section className={styles.timelineSection}>
          <h3>Developmental Timeline</h3>
          <div className={styles.timeline}>
            <MilestoneTracker 
              data={data.milestones}
              onChange={() => {}} // Read-only view
            />
          </div>
        </section>
      )}

      {/* Assessment Logs Section */}
      {showAssessmentLogs && (
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
      )}

      {/* Show message if no data available */}
      {!showSensoryData && !showSocialData && !showBehaviorData && 
       !showMilestones && !showAssessmentLogs && (
        <div className={styles.noData}>
          <p>No assessment data available yet. Complete other sections to see the summary.</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentSummary; 