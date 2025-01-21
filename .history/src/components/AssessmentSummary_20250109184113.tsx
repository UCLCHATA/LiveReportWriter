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
      <div className={styles.graphContainer}>
        <h3>Combined Assessment Profile</h3>
        <CombinedRadarGraph
          sensoryData={data?.sensoryProfile}
          socialData={data?.socialCommunication}
          behaviorData={data?.behaviorInterests}
        />
      </div>
    </div>
  );
};

export default AssessmentSummary; 