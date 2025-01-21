import React from 'react';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import styles from './AssessmentSummary.module.css';
import type { AssessmentData, Milestone } from '../types';

interface AssessmentSummaryProps {
  data: AssessmentData;
  onChange: (data: any) => void;
  currentStep?: number;
}

const TimelineViewer: React.FC<{ milestones: Milestone[] }> = ({ milestones }) => {
  if (!milestones?.length) return null;

  const maxAge = 72; // 6 years
  const timeMarkers = [
    { label: '0y', value: 0 },
    { label: '6m', value: 6 },
    { label: '1y', value: 12 },
    { label: '18m', value: 18 },
    { label: '2y', value: 24 },
    { label: '30m', value: 30 },
    { label: '3y', value: 36 },
    { label: '42m', value: 42 },
    { label: '4y', value: 48 },
    { label: '54m', value: 54 },
    { label: '5y', value: 60 },
    { label: '66m', value: 66 }
  ];

  const placedMilestones = milestones.filter(m => m.actualAge !== undefined);

  return (
    <div className={styles.timelineViewer}>
      <div className={styles.timelineGrid}>
        {timeMarkers.map((marker, i) => (
          <div 
            key={i} 
            className={styles.timeMarker}
            style={{ left: `${(marker.value / maxAge) * 100}%` }}
          >
            <span className={styles.markerLabel}>{marker.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.milestonesLayer}>
        {placedMilestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`${styles.timelineMilestone} ${styles[milestone.status || '']}`}
            style={{
              left: `${(milestone.actualAge / maxAge) * 100}%`,
              top: `${(milestone.stackPosition || 0) * 35}px`
            }}
          >
            {milestone.title}
            <span className={styles.ageIndicator}>{milestone.actualAge}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data, onChange, currentStep }) => {
  const isFinalStep = currentStep === 5;

  return (
    <div className={styles.container}>
      <CombinedRadarGraph
        sensoryData={data?.sensoryProfile}
        socialData={data?.socialCommunication}
        behaviorData={data?.behaviorInterests}
      />
      {isFinalStep && data?.milestoneTracker?.milestones && (
        <TimelineViewer milestones={data.milestoneTracker.milestones} />
      )}
    </div>
  );
};

export default AssessmentSummary; 