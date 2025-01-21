import React from 'react';
import { motion } from 'framer-motion';
import styles from './AssessmentSummary.module.css';
import { SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import type { AssessmentData } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data }) => {
  return (
    <div className={styles.container}>
      {/* Combined Radar Graph Section */}
      <section className={styles.graphSection}>
        <h3>Combined Assessment Profile</h3>
        <div className={styles.combinedGraph}>
          {/* We'll implement the combined graph here */}
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
          {/* We'll implement the assessment logs display here */}
        </div>
      </section>
    </div>
  );
};

export default AssessmentSummary; 