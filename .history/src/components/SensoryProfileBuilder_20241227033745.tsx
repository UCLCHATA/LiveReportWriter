import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

type SensoryDomain = {
  name: string;
  sensitivity: number;
  observations: string[];
  label: 'Under-responsive' | 'Over-responsive';
};

export const SensoryProfileBuilder: React.FC = () => {
  const [domains, setDomains] = useState<Record<string, SensoryDomain>>({
    visual: { name: 'Visual', sensitivity: 5, observations: [], label: 'Under-responsive' },
    auditory: { name: 'Auditory', sensitivity: 5, observations: [], label: 'Over-responsive' },
    tactile: { name: 'Tactile', sensitivity: 5, observations: [], label: 'Over-responsive' },
    vestibular: { name: 'Vestibular', sensitivity: 5, observations: [], label: 'Under-responsive' },
    proprioceptive: { name: 'Proprioceptive', sensitivity: 5, observations: [], label: 'Under-responsive' },
    oral: { name: 'Oral', sensitivity: 5, observations: [], label: 'Under-responsive' },
  });

  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleSensitivityChange = (domain: string, value: number) => {
    setDomains(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        sensitivity: value,
        label: value < 5 ? 'Under-responsive' : 'Over-responsive'
      }
    }));
  };

  const addObservation = (domain: string) => {
    if (newObservation.trim()) {
      setDomains(prev => ({
        ...prev,
        [domain]: {
          ...prev[domain],
          observations: [...prev[domain].observations, newObservation.trim()]
        }
      }));
      setNewObservation('');
    }
  };

  const radarData = Object.entries(domains).map(([key, value]) => ({
    domain: value.name,
    sensitivity: value.sensitivity,
    fullMark: 10
  }));

  return (
    <div className="sensory-profile">
      <div className="profile-header">
        <h2>Sensory Profile</h2>
        <AlertCircle className="help-icon" />
      </div>
      
      <div className="profile-content">
        <div className="sliders-container">
          {Object.entries(domains).map(([key, domain]) => (
            <div key={key} className="domain-slider">
              <div className="slider-header">
                <span className="domain-name">{domain.name}</span>
                <span className="sensitivity-label">{domain.label}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={domain.sensitivity}
                onChange={(e) => handleSensitivityChange(key, Number(e.target.value))}
                className="sensitivity-slider"
              />
              <div className="observations">
                {domain.observations.map((obs, idx) => (
                  <div key={idx} className="observation-item">
                    {obs}
                  </div>
                ))}
                <div className="add-observation">
                  <input
                    type="text"
                    placeholder="Add observation..."
                    value={selectedDomain === key ? newObservation : ''}
                    onChange={(e) => setNewObservation(e.target.value)}
                    onFocus={() => setSelectedDomain(key)}
                  />
                  <button onClick={() => addObservation(key)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="radar-container">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" />
              <Radar
                name="Sensitivity"
                dataKey="sensitivity"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 