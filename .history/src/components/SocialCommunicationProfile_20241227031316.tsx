import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

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
    title: "Non-verbal Communication",
    description: "Use and understanding of gestures and expressions",
    examples: ["Eye contact", "Facial expressions", "Body language"]
  },
  relationships: {
    title: "Relationships",
    description: "Building and maintaining relationships",
    examples: ["Peer interactions", "Friendship development"]
  },
  emotionalRegulation: {
    title: "Emotional Regulation",
    description: "Managing and expressing emotions",
    examples: ["Coping with changes", "Emotional responses"]
  },
  adaptiveFunctioning: {
    title: "Adaptive Functioning",
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="font-bold text-lg">Social Communication Profile</h3>
        <span className="material-icons text-gray-500 cursor-help">info</span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            {Object.entries(socialData).map(([domain, data]) => (
              <div key={domain} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {domainDescriptions[domain].title}
                    <span 
                      className="ml-2 text-xs text-gray-500 cursor-help"
                      title={domainDescriptions[domain].description}
                    >
                      ⓘ
                    </span>
                  </label>
                  <span className="text-sm text-gray-500">
                    {data.rating}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={data.rating}
                  onChange={(e) => handleRatingChange(domain, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="space-y-1">
                  {data.observations.map((obs, idx) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                      {obs}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add observation..."
                      className="flex-1 text-sm p-2 border rounded"
                      value={selectedDomain === domain ? newObservation : ''}
                      onChange={(e) => setNewObservation(e.target.value)}
                      onFocus={() => setSelectedDomain(domain)}
                    />
                    <button
                      onClick={() => addObservation(domain)}
                      className="p-2 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      <span className="material-icons">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="domain" />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const domain = Object.keys(domainDescriptions).find(
                        key => domainDescriptions[key].title === payload[0].payload.domain
                      );
                      return domain ? (
                        <div className="bg-white p-2 shadow rounded">
                          <p>{domainDescriptions[domain].description}</p>
                        </div>
                      ) : null;
                    }
                    return null;
                  }}
                />
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
        </div>
      </CardContent>
    </Card>
  );
}; 