import React from 'react';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import styles from './AssessmentSummary.module.css';
import type { AssessmentData } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
  onChange: (data: any) => void;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data, onChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.graphSection}>
        <CombinedRadarGraph
          sensoryData={data?.sensoryProfile}
          socialData={data?.socialCommunication}
          behaviorData={data?.behaviorInterests}
        />
      </div>
      <div className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <h3>Development Timeline</h3>
        </div>
        <div className={styles.timelineContent}>
          <div className={styles.timelineGrid}>
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} className={styles.timelineMarker}>
                {i * 6}m
              </div>
            ))}
          </div>
          <div className={styles.categories}>
            <div className={styles.categoryRow}>
              <span className={styles.categoryLabel}>Communication</span>
              <div className={styles.milestones}>
                <div className={styles.milestone} style={{ left: '20%' }}>Babbling</div>
                <div className={styles.milestone} style={{ left: '40%' }}>First Words</div>
              </div>
            </div>
            <div className={styles.categoryRow}>
              <span className={styles.categoryLabel}>Motor</span>
              <div className={styles.milestones}>
                <div className={styles.milestone} style={{ left: '15%' }}>Head Control</div>
                <div className={styles.milestone} style={{ left: '35%' }}>Walking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary; 