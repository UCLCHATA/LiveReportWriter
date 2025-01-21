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
  fullMark: number;
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
      Object.entries(sensoryData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        dataPoints[domain] = {
          domain,
          sensory: data.value || 0,
          fullMark: 10
        };
      });
    }

    // Process social domains
    if (socialData?.domains) {
      Object.entries(socialData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 10 };
        }
        dataPoints[domain].social = data.value || 0;
      });
    }

    // Process behavior domains
    if (behaviorData?.domains) {
      Object.entries(behaviorData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 10 };
        }
        dataPoints[domain].behavior = data.value || 0;
      });
    }

    return Array.from(allDomains).map(domain => dataPoints[domain]);
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <div className={styles.noData}>
        <p>No assessment data available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis 
            dataKey="domain"
            tick={{ fill: '#4b5563', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]}
            tick={{ fill: '#4b5563', fontSize: 12 }}
          />
          
          {/* Sensory Profile Data */}
          {sensoryData && (
            <Radar
              name="Sensory Profile"
              dataKey="sensory"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.2}
            />
          )}
          
          {/* Social Communication Data */}
          {socialData && (
            <Radar
              name="Social Communication"
              dataKey="social"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
            />
          )}
          
          {/* Behavior & Interests Data */}
          {behaviorData && (
            <Radar
              name="Behavior & Interests"
              dataKey="behavior"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
            />
          )}
          
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedRadarGraph; 