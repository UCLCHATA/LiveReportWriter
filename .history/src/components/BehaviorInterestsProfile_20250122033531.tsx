import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './BehaviorInterestsProfile.module.css';

interface Domain {
  name: string;
  value: number | undefined;
  observations: string[];
  label: 'Not Present' | 'Minimal Impact' | 'Moderate Impact' | 'Significant Impact' | 'Severe Impact' | 'Skipped';
}

interface BehaviorInterestsData {
  domains: Record<string, Domain>;
}

interface BehaviorInterestsProfileProps {
  data: BehaviorInterestsData;
  onChange: (data: BehaviorInterestsData) => void;
}

interface BehaviorInterestsGraphProps {
  data: BehaviorInterestsData;
}

type BehaviorLabel = 'Not Present' | 'Minimal Impact' | 'Moderate Impact' | 'Significant Impact' | 'Severe Impact' | 'Skipped';

const getSensitivityLabel = (value: number | undefined): BehaviorLabel => {
  if (value === undefined) return 'Skipped';
  switch (value) {
    case 1: return 'Not Present';
    case 2: return 'Minimal Impact';
    case 3: return 'Moderate Impact';
    case 4: return 'Significant Impact';
    case 5: return 'Severe Impact';
    default: return 'Skipped';
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

export const BehaviorInterestsGraph: React.FC<BehaviorInterestsGraphProps> = ({ data }) => {
  if (!data?.domains) return null;

  const chartData = Object.values(data.domains).map(domain => ({
    subject: domain.name,
    A: domain.value,
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={chartData} margin={{ top: 5, right: 25, bottom: 5, left: 25 }}>
        <PolarGrid 
          gridType="polygon"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
          stroke="#94a3b8"
          strokeWidth={1}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[1, 5]} 
          tickCount={5} 
          tick={{ fontSize: 12, fill: '#374151' }}
          stroke="#94a3b8"
          strokeWidth={1}
        />
        <Radar
          name="Behavior"
          dataKey="A"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.2}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const BehaviorInterestsProfile: React.FC<BehaviorInterestsProfileProps> = ({ data, onChange }) => {
  const [newObservation, setNewObservation] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Initialize domains if not present in data
  useEffect(() => {
    if (!data?.domains) {
      onChange({
        domains: {
          repetitiveBehaviors: { name: 'Repetitive Behaviors', value: undefined, observations: [], label: 'Skipped' },
          restrictedInterests: { name: 'Restricted Interests', value: undefined, observations: [], label: 'Skipped' },
          sensorySeeking: { name: 'Sensory Seeking', value: undefined, observations: [], label: 'Skipped' },
          routineAdherence: { name: 'Routine Adherence', value: undefined, observations: [], label: 'Skipped' },
          flexibility: { name: 'Flexibility', value: undefined, observations: [], label: 'Skipped' },
          activityTransitions: { name: 'Activity Transitions', value: undefined, observations: [], label: 'Skipped' },
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
            min={1}
            max={5}
            value={domain.value ?? 3}
            onChange={(e) => handleSensitivityChange(key, parseInt(e.target.value))}
            className={styles.sensitivitySlider}
            style={{ background: getSliderBackground(domain.value ?? 3) }}
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
  );
}; 