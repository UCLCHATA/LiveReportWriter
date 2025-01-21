import React from 'react';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import { MilestoneTracker } from './MilestoneTracker';
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
        <MilestoneTracker 
          data={data?.milestoneTracker} 
          onChange={(milestoneData) => {
            onChange({
              ...data,
              milestoneTracker: milestoneData
            });
          }}
        />
      </div>
    </div>
  );
};

export default AssessmentSummary; 