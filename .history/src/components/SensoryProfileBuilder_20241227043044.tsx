import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { HelpCircle, Plus } from 'lucide-react';

type SensoryDomain = {
  name: string;
  sensitivity: number;
  observations: string[];
  label: 'Under-responsive' | 'Typical' | 'Over-responsive';
};

const getSensitivityLabel = (value: number): 'Under-responsive' | 'Typical' | 'Over-responsive' => {
  if (value < 3) return 'Under-responsive';
  if (value === 3) return 'Typical';
  return 'Over-responsive';
};

export const SensoryProfileBuilder: React.FC = () => {
  const [domains, setDomains] = useState<Record<string, SensoryDomain>>({
    visual: { name: 'Visual', sensitivity: 3, observations: [], label: 'Typical' },
    auditory: { name: 'Auditory', sensitivity: 3, observations: [], label: 'Typical' },
    tactile: { name: 'Tactile', sensitivity: 3, observations: [], label: 'Typical' },
    vestibular: { name: 'Vestibular', sensitivity: 3, observations: [], label: 'Typical' },
    proprioceptive: { name: 'Proprioceptive', sensitivity: 3, observations: [], label: 'Typical' },
    oral: { name: 'Oral', sensitivity: 3, observations: [], label: 'Typical' },
  });

  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleSensitivityChange = (domain: string, value: number) => {
    setDomains(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        sensitivity: value,
        label: getSensitivityLabel(value)
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
    fullMark: 5
  }));

  return (
    <div className="sensory-profile">      
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
                min="1"
                max="5"
                step="1"
                value={domain.sensitivity}
                onChange={(e) => handleSensitivityChange(key, Number(e.target.value))}
                className="sensitivity-slider"
              />
              <div className="add-observation">
                <input
                  type="text"
                  placeholder="Add observation..."
                  value={selectedDomain === key ? newObservation : ''}
                  onChange={(e) => setNewObservation(e.target.value)}
                  onFocus={() => setSelectedDomain(key)}
                  onKeyPress={(e) => e.key === 'Enter' && addObservation(key)}
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                />
                <button 
                  onClick={() => addObservation(key)} 
                  title="Add observation"
                  style={{ padding: '0.375rem 0.5rem' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              {domain.observations.length > 0 && (
                <div className="observations">
                  {domain.observations.map((obs, idx) => (
                    <div 
                      key={idx} 
                      className="observation-item"
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', marginBottom: '0.25rem' }}
                    >
                      {obs}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="radar-container">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" />
              <PolarRadiusAxis domain={[1, 5]} tickCount={5} />
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