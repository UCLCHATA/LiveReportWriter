import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { HelpCircle } from 'lucide-react';
import styles from './SensoryProfileBuilder.module.css';

interface SensoryDomain {
  name: string;
  value: number;
  observations: string[];
  label: 'Significantly Under-responsive' | 'Under-responsive' | 'Typical' | 'Over-responsive' | 'Significantly Over-responsive';
}

interface SensoryProfileData {
  domains: Record<string, SensoryDomain>;
}

interface SensoryProfileBuilderProps {
  data: SensoryProfileData;
  onChange: (data: SensoryProfileData) => void;
}

interface SensoryProfileGraphProps {
  data: SensoryProfileData;
}

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

export const SensoryProfileGraph: React.FC<SensoryProfileGraphProps> = ({ data }) => {
  if (!data?.domains) return null;

  const radarData = Object.values(data.domains).map(domain => ({
    domain: domain.name,
    sensitivity: domain.value,
    fullMark: 5
  }));

  return (
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
  );
};

export const SensoryProfileBuilder: React.FC<SensoryProfileBuilderProps> = ({ data, onChange }) => {
  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Initialize domains if not present in data
  useEffect(() => {
    if (!data?.domains) {
      onChange({
        domains: {
          visual: { name: 'Visual', value: undefined, observations: [], label: 'Typical' },
          auditory: { name: 'Auditory', value: undefined, observations: [], label: 'Typical' },
          tactile: { name: 'Tactile', value: undefined, observations: [], label: 'Typical' },
          vestibular: { name: 'Vestibular', value: undefined, observations: [], label: 'Typical' },
          proprioceptive: { name: 'Proprioceptive', value: undefined, observations: [], label: 'Typical' },
          oral: { name: 'Oral', value: undefined, observations: [], label: 'Typical' },
        }
      });
    }
  }, [data, onChange]);

  const handleSensitivityChange = (domain: string, value: number) => {
    if (!data?.domains) return;
    
    const updatedData = {
      type: 'sensoryProfile',
      domains: {
        ...data.domains,
        [domain]: {
          ...data.domains[domain],
          value,
          label: getSensitivityLabel(value)
        }
      }
    };
    onChange(updatedData);
  };

  const getSliderBackground = (value: number) => {
    const percentage = ((value - 1) / 4) * 100;
    return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
  };

  const addObservation = (domain: string) => {
    if (!data?.domains || !newObservation.trim()) return;
    
    const updatedData = {
      type: 'sensoryProfile',
      domains: {
        ...data.domains,
        [domain]: {
          ...data.domains[domain],
          observations: [...(data.domains[domain].observations || []), newObservation.trim()]
        }
      }
    };
    onChange(updatedData);
    setNewObservation('');
  };

  const deleteObservation = (domain: string, index: number) => {
    if (!data?.domains) return;
    
    onChange({
      domains: {
        ...data.domains,
        [domain]: {
          ...data.domains[domain],
          observations: data.domains[domain].observations.filter((_, i) => i !== index)
        }
      }
    });
  };

  const handleUpdateDomain = (domainId: string, updates: Partial<SensoryDomain>) => {
    const updatedData = {
      type: 'sensoryProfile',
      domains: {
        ...data.domains,
        [domainId]: {
          ...data.domains[domainId],
          ...updates
        }
      }
    };
    onChange(updatedData);
  };

  const handleTooltipPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const tooltip = e.currentTarget.querySelector(`.${styles.tooltipContent}`) as HTMLElement;
    if (!tooltip) return;

    // Get cursor position
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    // Get viewport dimensions
    const viewportHeight = window.innerHeight;

    // Get tooltip dimensions
    const tooltipHeight = tooltip.offsetHeight;

    // Calculate vertical position - always try to position below cursor first
    let top = cursorY + 8;

    // If tooltip would overflow bottom of viewport, position above cursor
    if (top + tooltipHeight > viewportHeight - 10) {
      top = cursorY - tooltipHeight - 8;
    }

    // Apply vertical position only (horizontal is handled by CSS)
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${cursorX}px`; // Base position for CSS transforms
  };

  if (!data?.domains) return null;

  return (
    <div className={styles.slidersGrid}>
      {Object.entries(data.domains).map(([key, domain]) => (
        <div key={key} className={styles.domainSlider}>
          <div className={styles.sliderHeader}>
            <span className={styles.domainName}>{domain.name}</span>
            <span className={styles.sensitivityLabel}>{domain.label}</span>
            <div 
              className={styles.tooltipWrapper}
              onMouseMove={handleTooltipPosition}
            >
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
            value={domain.value}
            onChange={(e) => handleSensitivityChange(key, Number(e.target.value))}
            className={styles.sensitivitySlider}
            style={{ background: getSliderBackground(domain.value) }}
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
              <textarea
                placeholder="Add observation..."
                value={selectedDomain === key ? newObservation : ''}
                onChange={(e) => {
                  setNewObservation(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={() => setSelectedDomain(key)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addObservation(key);
                  }
                }}
              />
              <button onClick={() => addObservation(key)}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 