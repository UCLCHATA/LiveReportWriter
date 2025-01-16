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
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 5 };
        }
        if (typeof data.value === 'number') {
          dataPoints[domain].sensory = data.value;
        }
      });
    }

    // Process social domains
    if (socialData?.domains) {
      Object.entries(socialData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 5 };
        }
        if (typeof data.value === 'number') {
          dataPoints[domain].social = data.value;
        }
      });
    }

    // Process behavior domains
    if (behaviorData?.domains) {
      Object.entries(behaviorData.domains).forEach(([key, data]) => {
        const domain = data.name || key;
        allDomains.add(domain);
        if (!dataPoints[domain]) {
          dataPoints[domain] = { domain, fullMark: 5 };
        }
        if (typeof data.value === 'number') {
          dataPoints[domain].behavior = data.value;
        }
      });
    }

    // Convert to array and ensure all values are numbers
    const result = Array.from(allDomains).map(domain => ({
      ...dataPoints[domain],
      sensory: typeof dataPoints[domain].sensory === 'number' ? dataPoints[domain].sensory : undefined,
      social: typeof dataPoints[domain].social === 'number' ? dataPoints[domain].social : undefined,
      behavior: typeof dataPoints[domain].behavior === 'number' ? dataPoints[domain].behavior : undefined
    }));

    return result;
  };

  const data = processData();
  
  // Only render if we have data to show
  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.graphWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="75%" 
            data={data}
            margin={{ top: 15, right: 50, bottom: 15, left: 50 }}
            className="combined-radar-chart"
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="domain"
              tick={({ x, y, payload, index, cx, cy }: any) => {
                const dx = x - cx;
                const dy = y - cy;
                const theta = Math.atan2(dy, dx);
                const deg = theta * 180 / Math.PI;
                
                const isVertical = Math.abs(Math.abs(deg) - 90) < 10 || Math.abs(Math.abs(deg) - 270) < 10;
                
                if (isVertical) {
                  const isVisualLabel = payload.value === "Visual";
                  const isTop = isVisualLabel ? true : Math.abs(Math.abs(deg) - 270) < 10;
                  
                  return (
                    <text 
                      x={x}
                      y={isTop ? y - 25 : y + 25}
                      fill={index % 2 === 0 ? '#1f2937' : '#4b5563'}
                      textAnchor="middle"
                      fontSize={12}
                      dominantBaseline={isTop ? "bottom" : "top"}
                      style={{ userSelect: 'none' }}
                    >
                      {payload.value}
                    </text>
                  );
                }

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
              stroke={behaviorData ? '#f59e0b' : 'transparent'}
              fill={behaviorData ? '#f59e0b' : 'transparent'}
              fillOpacity={0.2}
            />
            
            <Radar
              name="Social Communication"
              dataKey="social"
              stroke={socialData ? '#10b981' : 'transparent'}
              fill={socialData ? '#10b981' : 'transparent'}
              fillOpacity={0.2}
            />
            
            <Radar
              name="Sensory Profile"
              dataKey="sensory"
              stroke={sensoryData ? '#be185d' : 'transparent'}
              fill={sensoryData ? '#be185d' : 'transparent'}
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