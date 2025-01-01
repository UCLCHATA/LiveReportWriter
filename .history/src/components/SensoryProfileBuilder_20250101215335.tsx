import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { HelpCircle } from 'lucide-react';
import styles from './SensoryProfileBuilder.module.css';

type SensoryDomain = {
  name: string;
  sensitivity: number;
  observations: string[];
  label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive';
};

const getSensitivityLabel = (value: number): 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive' => {
  switch (value) {
    case 1: return 'Significantly Under-responsive';
    case 2: return 'Under-responsive';
    case 3: return 'Typical';
    case 4: return 'Over-responsive';
    case 5: return 'Significantly Over-responsive';
    default: return 'Typical';
  }
};

const getDomainTooltip = (domain: string): string => {
  switch (domain) {
    case 'Visual':
      return 'DSM-5 B.4 & ICF b156:\n• Hyper/hypo-reactivity to visual stimuli\n• Unusual interest in lights/spinning objects\n• Visual inspection behaviors\n• Peripheral vision use\n• Visual perception functions';
    case 'Auditory':
      return 'DSM-5 B.4 & ICF b230:\n• Hyper/hypo-reactivity to sounds\n• Adverse response to specific sounds\n• Sound discrimination difficulties\n• Sound seeking behaviors\n• Hearing functions';
    case 'Tactile':
      return 'DSM-5 B.4 & ICF b265:\n• Tactile defensiveness or seeking\n• Altered pain/temperature response\n• Unusual exploration of textures\n• Touch function impairments\n• Pressure sensitivity';
    case 'Vestibular':
      return 'DSM-5 B.4 & ICF b235:\n• Atypical movement patterns\n• Balance insecurity/seeking\n• Movement avoidance/craving\n• Vestibular function challenges\n• Spatial orientation';
    case 'Proprioceptive':
      return 'DSM-5 B.4 & ICF b260:\n• Body awareness difficulties\n• Postural control challenges\n• Motor planning issues\n• Proprioceptive function\n• Position/movement sense';
    case 'Oral':
      return 'DSM-5 B.4 & ICF b250:\n• Food texture sensitivities\n• Oral seeking behaviors\n• Taste/texture aversions\n• Gustatory functions\n• Eating challenges';
    default:
      return 'Rate sensory processing patterns in this domain';
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
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[1, 5]} tickCount={5} tick={{ fontSize: 11 }} />
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