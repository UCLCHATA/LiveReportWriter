import React from 'react';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import styles from './AssessmentSummary.module.css';
import type { AssessmentData } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
  onChange: (data: any) => void;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data, onChange }) => {
  // Show graph if any assessment has domains defined
  const showGraph = !!(data?.sensoryProfile?.domains || 
    data?.socialCommunication?.domains || 
    data?.behaviorInterests?.domains);

  return (
    <div className={styles.container}>
      {showGraph ? (
        <div className={styles.graphContainer}>
          <h3>Combined Assessment Profile</h3>
          <CombinedRadarGraph
            sensoryData={data?.sensoryProfile}
            socialData={data?.socialCommunication}
            behaviorData={data?.behaviorInterests}
          />
        </div>
      ) : (
        <div className={styles.noData}>
          <p>No assessment data available yet. Complete other sections to see the summary.</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentSummary; 