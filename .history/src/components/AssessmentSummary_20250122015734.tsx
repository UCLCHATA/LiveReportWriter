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
      <CombinedRadarGraph
        sensoryData={data?.sensoryProfile}
        socialData={data?.socialCommunication}
        behaviorData={data?.behaviorInterests}
      />
    </div>
  );
};

export default AssessmentSummary; 