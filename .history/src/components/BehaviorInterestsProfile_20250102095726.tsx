import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './BehaviorInterestsProfile.module.css';

interface Domain {
  name: string;
  value: number;
  observations: string[];
  label: 'Not Present' | 'Minimal Impact' | 'Moderate Impact' | 'Significant Impact' | 'Severe Impact';
}

interface BehaviorInterestsData {
  domains: Record<string, Domain>;
}

interface BehaviorInterestsProfileProps {
  data: BehaviorInterestsData;
  onChange: (data: BehaviorInterestsData) => void;
}

const getSensitivityLabel = (value: number): 'Not Present' | 'Minimal Impact' | 'Moderate Impact' | 'Significant Impact' | 'Severe Impact' => {
  switch (value) {
    case 1: return 'Not Present';
    case 2: return 'Minimal Impact';
    case 3: return 'Moderate Impact';
    case 4: return 'Significant Impact';
    case 5: return 'Severe Impact';
    default: return 'Moderate Impact';
  }
};

const getDomainTooltip = (domain: string): string => {
  switch (domain) {
    case 'Repetitive Behaviors':
      return 'DSM-5 B.1 & ICF b147:\n• Stereotyped movements\n• Motor mannerisms\n• Object manipulation\n• Repetitive speech\n• Psychomotor functions';
    case 'Restricted Interests':
      return 'DSM-5 B.3 & ICF b1301:\n• Interest intensity\n• Topic perseveration\n• Focus fixation\n• Motivation functions\n• Interest flexibility';
    case 'Sensory Seeking':
      return 'DSM-5 B.4 & ICF b250-b270:\n• Sensory exploration\n• Stimulation seeking\n• Sensory avoidance\n• Sensory functions\n• Environmental interaction';
    case 'Routine Adherence':
      return 'DSM-5 B.2 & ICF b1641:\n• Routine rigidity\n• Change resistance\n• Ritual behaviors\n• Organization of events\n• Schedule adherence';
    case 'Flexibility':
      return 'DSM-5 B.2 & ICF d175:\n• Cognitive flexibility\n• Adaptation ability\n• Problem solving\n• Solving problems\n• Alternative approaches';
    case 'Activity Transitions':
      return 'DSM-5 B.2 & ICF d230:\n• Transition management\n• Activity switching\n• Daily routine\n• Carrying out daily routine\n• Schedule changes';
    default:
      return 'Rate behavioral patterns and their impact on daily functioning';
  }
};

const getSliderBackground = (value: number) => {
  const percentage = ((value - 1) / 4) * 100;
  return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
};

export const BehaviorInterestsProfile: React.FC<BehaviorInterestsProfileProps> = ({ data, onChange }) => {
  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Initialize domains if not present in data
  useEffect(() => {
    if (!data?.domains) {
      onChange({
        domains: {
          repetitiveBehaviors: { name: 'Repetitive Behaviors', value: 3, observations: [], label: 'Moderate Impact' },
          restrictedInterests: { name: 'Restricted Interests', value: 3, observations: [], label: 'Moderate Impact' },
          sensorySeeking: { name: 'Sensory Seeking', value: 3, observations: [], label: 'Moderate Impact' },
          routineAdherence: { name: 'Routine Adherence', value: 3, observations: [], label: 'Moderate Impact' },
          flexibility: { name: 'Flexibility', value: 3, observations: [], label: 'Moderate Impact' },
          activityTransitions: { name: 'Activity Transitions', value: 3, observations: [], label: 'Moderate Impact' },
        }
      });
    }
  }, [data, onChange]);

  const handleSensitivityChange = (domain: string, value: number) => {
    if (!data?.domains) return;
    
    const updatedData = {
      type: 'behaviorInterests',
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

  const addObservation = (domain: string) => {
    if (!data?.domains || !newObservation.trim()) return;
    
    const updatedData = {
      type: 'behaviorInterests',
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

  const handleUpdateDomain = (domainId: string, updates: Partial<Domain>) => {
    const updatedData = {
      type: 'behaviorInterests',
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

  if (!data?.domains) return null;

  const chartData = Object.values(data.domains).map(domain => ({
    subject: domain.name,
    A: domain.value,
    fullMark: 5,
  }));

  return (
    <div className={styles.carouselContainer}>      
      <div className={styles.carouselContent}>
        <div className={styles.componentWithGraph}>
          <div className={styles.graphSection}>
            <div className={styles.radarContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[1, 5]} />
                  <Radar
                    name="Behavior & Interests"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={styles.sliderSection}>
            <div className={styles.slidersGrid}>
              {Object.entries(data.domains).map(([key, domain]) => (
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
                    min={1}
                    max={5}
                    value={domain.value}
                    onChange={(e) => handleSensitivityChange(key, parseInt(e.target.value))}
                    className={styles.sensitivitySlider}
                    style={{ background: getSliderBackground(domain.value) }}
                  />

                  <div className={styles.observations}>
                    {domain.observations.map((obs, obsIndex) => (
                      <div key={obsIndex} className={styles.observationItem}>
                        {obs}
                        <button
                          onClick={() => deleteObservation(key, obsIndex)}
                          className={styles.deleteObservation}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className={styles.addObservation}>
                      <input
                        type="text"
                        value={selectedDomain === key ? newObservation : ''}
                        onChange={(e) => setNewObservation(e.target.value)}
                        onFocus={() => setSelectedDomain(key)}
                        onKeyPress={(e) => e.key === 'Enter' && addObservation(key)}
                        placeholder="Add observation..."
                      />
                      <button onClick={() => addObservation(key)}>Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 