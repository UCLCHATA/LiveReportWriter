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
      <h2 className={styles.title}>Combined Assessment Profile</h2>
      <div className={styles.graphWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="85%" data={data}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="domain"
              tick={(props) => {
                const { x, y, payload } = props;
                // Determine color based on which component the domain belongs to
                let color = '#4b5563'; // default
                const domainKey = payload.value.toLowerCase().replace(/[- ]/g, '');
                
                if (sensoryData?.domains && domainKey in sensoryData.domains) {
                  color = '#be185d'; // pink/maroon for sensory
                } else if (socialData?.domains && domainKey in socialData.domains) {
                  color = '#10b981'; // green for social
                } else if (behaviorData?.domains && domainKey in behaviorData.domains) {
                  color = '#f59e0b'; // amber for behavior
                }
                
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill={color} 
                    textAnchor="middle" 
                    fontSize={12}
                    dy={3} // Add some vertical offset
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 5]}
              tick={{ fill: '#4b5563', fontSize: 12 }}
            />
            
            {/* Always show all three radars */}
            <Radar
              name="Sensory Profile"
              dataKey="sensory"
              stroke="#be185d"
              fill="#be185d"
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
              name="Behavior & Interests"
              dataKey="behavior"
              stroke="#f59e0b"
              fill="#f59e0b"
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