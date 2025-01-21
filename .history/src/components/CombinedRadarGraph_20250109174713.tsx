import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type {
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  AssessmentDomainBase
} from '../types';
import styles from './CombinedRadarGraph.module.css';

interface CombinedRadarGraphProps {
  sensoryData?: SensoryProfileData;
  socialData?: SocialCommunicationData;
  behaviorData?: BehaviorInterestsData;
}

interface DataPoint {
  domain: string;
  sensory?: number;
  social?: number;
  behavior?: number;
}

export const CombinedRadarGraph: React.FC<CombinedRadarGraphProps> = ({
  sensoryData,
  socialData,
  behaviorData
}) => {
  const processData = (): DataPoint[] => {
    const allDomains = new Set<string>();
    const dataPoints: { [key: string]: DataPoint } = {};

    // Process sensory domains
    if (sensoryData?.domains) {
      Object.entries(sensoryData.domains).forEach(([domain, data]) => {
        allDomains.add(domain);
        dataPoints[domain] = {
          domain,
          sensory: (data as AssessmentDomainBase).value || 0
        };
      });
    }

    // Process social domains
    if (socialData?.domains) {
      Object.entries(socialData.domains).forEach(([domain, data]) => {
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain };
        }
        dataPoints[domain].social = (data as AssessmentDomainBase).value || 0;
      });
    }

    // Process behavior domains
    if (behaviorData?.domains) {
      Object.entries(behaviorData.domains).forEach(([domain, data]) => {
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain };
        }
        dataPoints[domain].behavior = (data as AssessmentDomainBase).value || 0;
      });
    }

    return Array.from(allDomains).map(domain => dataPoints[domain]);
  };

  const data = processData();

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          
          {/* Sensory Profile Data */}
          <Radar
            name="Sensory Profile"
            dataKey="sensory"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.2}
          />
          
          {/* Social Communication Data */}
          <Radar
            name="Social Communication"
            dataKey="social"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
          
          {/* Behavior & Interests Data */}
          <Radar
            name="Behavior & Interests"
            dataKey="behavior"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.2}
          />
          
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedRadarGraph; 