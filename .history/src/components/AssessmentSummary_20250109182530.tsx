import React, { useEffect } from 'react';
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
  useEffect(() => {
    console.log('AssessmentSummary - Initial data:', data);
  }, []);

  // Only show sections that have data
  const showSensoryData = data.sensoryProfile?.domains && 
    Object.values(data.sensoryProfile.domains).some(domain => domain.value > 0);
  
  const showSocialData = data.socialCommunication?.domains && 
    Object.values(data.socialCommunication.domains).some(domain => domain.value > 0);
  
  const showBehaviorData = data.behaviorInterests?.domains && 
    Object.values(data.behaviorInterests.domains).some(domain => domain.value > 0);

  useEffect(() => {
    console.log('Data presence checks:', {
      showSensoryData,
      sensoryDomains: data.sensoryProfile?.domains,
      showSocialData,
      socialDomains: data.socialCommunication?.domains,
      showBehaviorData,
      behaviorDomains: data.behaviorInterests?.domains
    });
  }, [showSensoryData, showSocialData, showBehaviorData, data]);

  // Show graph if any assessment has data
  const showGraph = data.sensoryProfile?.domains || 
    data.socialCommunication?.domains || 
    data.behaviorInterests?.domains;

  useEffect(() => {
    console.log('Graph visibility:', {
      showGraph,
      hasAnyDomains: {
        sensory: !!data.sensoryProfile?.domains,
        social: !!data.socialCommunication?.domains,
        behavior: !!data.behaviorInterests?.domains
      }
    });
  }, [showGraph, data]);

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

  const showMilestones = data.milestones?.milestones && data.milestones.milestones.length > 0;
  const showAssessmentLogs = data.assessmentLog?.selectedAssessments && data.assessmentLog.selectedAssessments.length > 0;

  const hasAnyData = showGraph || showMilestones || showAssessmentLogs;

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
      {showGraph ? (
        <motion.section 
          className={styles.graphSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Combined Assessment Profile</h3>
          <div className={styles.combinedGraph}>
            {console.log('Rendering CombinedRadarGraph with data:', {
              sensoryProfile: data.sensoryProfile,
              socialCommunication: data.socialCommunication,
              behaviorInterests: data.behaviorInterests
            })}
            <CombinedRadarGraph
              sensoryData={data.sensoryProfile}
              socialData={data.socialCommunication}
              behaviorData={data.behaviorInterests}
            />
          </div>
        </motion.section>
      ) : (
        console.log('Graph not shown because showGraph is false')
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