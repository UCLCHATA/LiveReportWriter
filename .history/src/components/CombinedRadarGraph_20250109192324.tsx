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
  console.log('CombinedRadarGraph - Received props:', {
    sensoryData,
    socialData,
    behaviorData
  });

  const processData = (): DataPoint[] => {
    const allDomains = new Set<string>();
    const dataPoints: { [key: string]: DataPoint } = {};

    // Process sensory domains
    if (sensoryData?.domains) {
      console.log('Processing sensory domains:', sensoryData.domains);
      Object.entries(sensoryData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 10 };
        }
        dataPoints[domain].sensory = data.value;
        console.log(`Added sensory data for domain ${domain}:`, data.value);
      });
    }

    // Process social domains
    if (socialData?.domains) {
      console.log('Processing social domains:', socialData.domains);
      Object.entries(socialData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 10 };
        }
        dataPoints[domain].social = data.value;
        console.log(`Added social data for domain ${domain}:`, data.value);
      });
    }

    // Process behavior domains
    if (behaviorData?.domains) {
      console.log('Processing behavior domains:', behaviorData.domains);
      Object.entries(behaviorData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 10 };
        }
        dataPoints[domain].behavior = data.value;
        console.log(`Added behavior data for domain ${domain}:`, data.value);
      });
    }

    // Convert to array and ensure all values are numbers
    const result = Array.from(allDomains).map(domain => ({
      ...dataPoints[domain],
      sensory: dataPoints[domain].sensory || 0,
      social: dataPoints[domain].social || 0,
      behavior: dataPoints[domain].behavior || 0
    }));

    console.log('Final processed data:', result);
    return result;
  };

  const data = processData();
  console.log('Data ready for radar chart:', data);

  // Show graph even if there's no data, just with zero values
  return (
    <div className={styles.container}>
      <div className={styles.graphWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="75%" 
            data={data}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="domain"
              tick={({ x, y, payload, index }: any) => {
                const cx = window.innerWidth / 2;
                const isRightSide = x > cx;
                
                // Adjust x position based on text length and side
                const textLength = payload.value.length;
                const xOffset = isRightSide ? 10 : -10;
                const adjustedX = isRightSide ? x + xOffset : x - xOffset;
                
                // Adjust y position to prevent overlap
                const yOffset = index % 2 === 0 ? -10 : 10;
                const adjustedY = y + yOffset;
                
                return (
                  <text 
                    x={adjustedX} 
                    y={adjustedY} 
                    fill={index % 2 === 0 ? '#1f2937' : '#4b5563'}
                    textAnchor={isRightSide ? 'start' : 'end'}
                    fontSize={12}
                    alignmentBaseline="middle"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[1, 5]}
              tickCount={5}
              tick={{ fill: '#4b5563', fontSize: 12 }}
              ticks={[1, 2, 3, 4, 5]}
            />
            
            <Radar
              name="Behavior & Interests"
              dataKey="behavior"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
            />
            
            <Radar
              name="Social Communication"
              dataKey="social"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
            />
            
            <Radar
              name="Sensory Profile"
              dataKey="sensory"
              stroke="#be185d"
              fill="#be185d"
              fillOpacity={0.2}
            />
            
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CombinedRadarGraph; 