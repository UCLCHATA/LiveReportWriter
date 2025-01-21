import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { HelpCircle } from 'lucide-react';
import styles from './SensoryProfileBuilder.module.css';

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

const getDomainTooltip = (domain: string): string => {
  switch (domain) {
    case 'Visual':
      return 'DSM-5 B.4:\n• Hyper/hypo-reactivity to visual input\n• Fascination with lights/movement\n• Visual inspection of objects\n• Peripheral vision use';
    case 'Auditory':
      return 'DSM-5 B.4:\n• Adverse response to specific sounds\n• Hyper/hypo-reactivity to auditory input\n• Sound discrimination issues\n• Sound seeking behaviors';
    case 'Tactile':
      return 'DSM-5 B.4:\n• Tactile defensiveness\n• Reduced response to pain/temperature\n• Unusual exploration of surfaces\n• Aversion to textures';
    case 'Vestibular':
      return 'DSM-5 B.4:\n• Unusual body movements\n• Gravitational insecurity\n• Movement seeking/avoidance\n• Balance difficulties';
    case 'Proprioceptive':
      return 'DSM-5 B.4:\n• Body awareness challenges\n• Unusual body positioning\n• Motor planning difficulties\n• Pressure/movement seeking';
    case 'Oral':
      return 'DSM-5 B.4:\n• Food texture sensitivities\n• Unusual mouthing of objects\n• Limited food preferences\n• Oral sensory seeking';
    default:
      return 'Rate sensory responsiveness in this domain';
  }
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

  const getSliderBackground = (value: number) => {
    const percentage = ((value - 1) / 4) * 100;
    return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
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

  const deleteObservation = (domain: string, index: number) => {
    setDomains(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        observations: prev[domain].observations.filter((_, i) => i !== index)
      }
    }));
  };

  const radarData = Object.entries(domains).map(([key, value]) => ({
    domain: value.name,
    sensitivity: value.sensitivity,
    fullMark: 5
  }));

  return (
    <div className={styles.sensoryProfile}>      
      <div className={styles.profileContent}>
        <div className={styles.radarContainer}>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} margin={{ top: 5, right: 25, bottom: 5, left: 25 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[1, 5]} tickCount={5} tick={{ fontSize: 10 }} />
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
        
        <div className={styles.slidersGrid}>
          {Object.entries(domains).map(([key, domain]) => (
            <div key={key} className={styles.domainSlider}>
              <div className={styles.sliderHeader}>
                <span className={styles.domainName}>{domain.name}</span>
                <span className={styles.sensitivityLabel}>{domain.label}</span>
                <div className={styles.tooltipWrapper}>
                  <HelpCircle className={styles.helpIcon} size={14} />
                  <div className={styles.tooltipContent}>
                    {getDomainTooltip(domain.name)}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={domain.sensitivity}
                onChange={(e) => handleSensitivityChange(key, Number(e.target.value))}
                className={styles.sensitivitySlider}
                style={{ background: getSliderBackground(domain.sensitivity) }}
              />
              <div className={styles.observations}>
                {domain.observations.map((obs, idx) => (
                  <div key={idx} className={styles.observationItem}>
                    <span>{obs}</span>
                    <button 
                      className={styles.deleteObservation}
                      onClick={() => deleteObservation(key, idx)}
                      aria-label="Delete observation"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className={styles.addObservation}>
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
      </div>
    </div>
  );
}; 