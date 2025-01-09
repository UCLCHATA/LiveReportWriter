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
          dataPoints[domain] = { domain, fullMark: 5 };
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
          dataPoints[domain] = { domain, fullMark: 5 };
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
          dataPoints[domain] = { domain, fullMark: 5 };
        }
        dataPoints[domain].behavior = data.value;
        console.log(`Added behavior data for domain ${domain}:`, data.value);
      });
    }

    // Convert to array and ensure all values are numbers, starting from 1 instead of 0
    const result = Array.from(allDomains).map(domain => ({
      ...dataPoints[domain],
      sensory: dataPoints[domain].sensory || 1,
      social: dataPoints[domain].social || 1,
      behavior: dataPoints[domain].behavior || 1
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
            outerRadius="65%" 
            data={data}
            margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="domain"
              tick={({ x, y, payload, index, cx }: any) => {
                const isRightSide = x > cx;
                const xOffset = isRightSide ? 10 : -10;
                
                return (
                  <text 
                    x={x + xOffset} 
                    y={y}
                    fill={index % 2 === 0 ? '#1f2937' : '#4b5563'}
                    textAnchor={isRightSide ? 'start' : 'end'}
                    fontSize={12}
                    dominantBaseline="middle"
                    style={{ userSelect: 'none' }}
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
              allowDataOverflow={false}
              scale="linear"
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