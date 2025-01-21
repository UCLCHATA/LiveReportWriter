import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, PolarRadiusAxis } from 'recharts';

interface DomainData {
  rating: number;
  observations: string[];
}

interface SocialDomains {
  [key: string]: DomainData;
}

const domainDescriptions = {
  socialReciprocity: {
    title: "Social Reciprocity",
    description: "Ability to engage in back-and-forth social interactions",
    examples: ["Turn-taking in conversation", "Responding to social cues"]
  },
  nonVerbalCommunication: {
    title: "Non-verbal",
    description: "Use and understanding of gestures and expressions",
    examples: ["Eye contact", "Facial expressions", "Body language"]
  },
  relationships: {
    title: "Relationships",
    description: "Building and maintaining relationships",
    examples: ["Peer interactions", "Friendship development"]
  },
  emotionalRegulation: {
    title: "Emotional",
    description: "Managing and expressing emotions",
    examples: ["Coping with changes", "Emotional responses"]
  },
  adaptiveFunctioning: {
    title: "Adaptive",
    description: "Daily living skills and independence",
    examples: ["Self-care", "Following routines"]
  }
};

export const SocialCommunicationProfile = () => {
  const [socialData, setSocialData] = useState<SocialDomains>({
    socialReciprocity: { rating: 3, observations: [] },
    nonVerbalCommunication: { rating: 3, observations: [] },
    relationships: { rating: 3, observations: [] },
    emotionalRegulation: { rating: 3, observations: [] },
    adaptiveFunctioning: { rating: 3, observations: [] }
  });

  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleRatingChange = (domain: string, value: number) => {
    setSocialData(prev => ({
      ...prev,
      [domain]: { ...prev[domain], rating: value }
    }));
  };

  const addObservation = (domain: string) => {
    if (newObservation.trim()) {
      setSocialData(prev => ({
        ...prev,
        [domain]: {
          ...prev[domain],
          observations: [...prev[domain].observations, newObservation.trim()]
        }
      }));
      setNewObservation('');
    }
  };

  const radarData = Object.entries(socialData).map(([key, value]) => ({
    domain: domainDescriptions[key].title,
    rating: value.rating,
    fullMark: 5
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const domain = Object.keys(domainDescriptions).find(
        key => domainDescriptions[key].title === payload[0].payload.domain
      );
      if (domain) {
        return (
          <div className="radar-tooltip">
            <p className="tooltip-title">{domainDescriptions[domain].title}</p>
            <p className="tooltip-desc">{domainDescriptions[domain].description}</p>
            <div className="tooltip-examples">
              {domainDescriptions[domain].examples.map((example, i) => (
                <div key={i} className="example-item">• {example}</div>
              ))}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="social-communication-profile">
      <div className="profile-header">
        <h3>Social Communication Profile</h3>
        <span 
          className="material-icons info-icon" 
          title="Rate from 1 (significant challenges) to 5 (advanced skills)"
        >
          info
        </span>
      </div>

      <div className="profile-content">
        <div className="radar-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid gridType="polygon" />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 12, fill: '#666' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Rating"
                dataKey="rating"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="ratings-container">
          {Object.entries(socialData).map(([domain, data]) => (
            <div key={domain} className="rating-section">
              <div className="rating-header">
                <label className="domain-label">
                  {domainDescriptions[domain].title}
                </label>
                <span className="rating-value">{data.rating}/5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={data.rating}
                onChange={(e) => handleRatingChange(domain, parseInt(e.target.value))}
                className="slider"
              />
              <div className="observations-container">
                {data.observations.map((obs, idx) => (
                  <div key={idx} className="observation-item">
                    {obs}
                  </div>
                ))}
                <div className="add-observation">
                  <input
                    type="text"
                    placeholder="Add observation..."
                    value={selectedDomain === domain ? newObservation : ''}
                    onChange={(e) => setNewObservation(e.target.value)}
                    onFocus={() => setSelectedDomain(domain)}
                  />
                  <button onClick={() => addObservation(domain)}>
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 