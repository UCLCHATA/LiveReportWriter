import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './SocialCommunicationProfile.module.css';

interface Domain {
  name: string;
  value: number;
  observations: string[];
  label: string;
}

const getSensitivityLabel = (value: number) => {
  switch (value) {
    case 1: return 'Minimal';
    case 2: return 'Mild';
    case 3: return 'Moderate';
    case 4: return 'Significant';
    case 5: return 'Severe';
    default: return 'Moderate';
  }
};

export const SocialCommunicationProfile: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([
    { name: 'Joint Attention', value: 3, observations: [], label: 'Emerging' },
    { name: 'Social Reciprocity', value: 3, observations: [], label: 'Emerging' },
    { name: 'Verbal Communication', value: 3, observations: [], label: 'Emerging' },
    { name: 'Non-verbal Communication', value: 3, observations: [], label: 'Emerging' },
    { name: 'Social Understanding', value: 3, observations: [], label: 'Emerging' },
    { name: 'Play Skills', value: 3, observations: [], label: 'Emerging' },
  ]);

  const [newObservation, setNewObservation] = useState<string>('');
  const [activeDomain, setActiveDomain] = useState<number | null>(null);

  const getSliderBackground = (value: number) => {
    const percentage = ((value - 1) / 4) * 100;
    return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
  };

  const handleSensitivityChange = (index: number, value: number) => {
    setDomains(prev => prev.map((domain, i) => 
      i === index ? { ...domain, value, label: getSensitivityLabel(value) } : domain
    ));
  };

  const handleAddObservation = (index: number) => {
    if (!newObservation.trim()) return;
    
    setDomains(prev => prev.map((domain, i) => 
      i === index 
        ? { ...domain, observations: [...domain.observations, newObservation.trim()] }
        : domain
    ));
    setNewObservation('');
  };

  const handleDeleteObservation = (domainIndex: number, obsIndex: number) => {
    setDomains(prev => prev.map((domain, i) => 
      i === domainIndex
        ? { ...domain, observations: domain.observations.filter((_, j) => j !== obsIndex) }
        : domain
    ));
  };

  const chartData = domains.map(domain => ({
    subject: domain.name,
    A: domain.value,
    fullMark: 5,
  }));

  return (
    <div className={styles.profileContent}>
      <div className={styles.radarContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[1, 5]} />
            <Radar
              name="Social Communication"
              dataKey="A"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.slidersGrid}>
        {domains.map((domain, index) => (
          <div key={domain.name} className={styles.domainSlider}>
            <div className={styles.sliderHeader}>
              <span className={styles.domainName}>{domain.name}</span>
              <span className={styles.sensitivityLabel}>{domain.label}</span>
              <div className={styles.tooltipWrapper}>
                <HelpCircle className={styles.helpIcon} size={14} />
                <div className={styles.tooltipContent}>
                  Rate the level of social communication skills in this domain
                </div>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={5}
              value={domain.value}
              onChange={(e) => handleSensitivityChange(index, parseInt(e.target.value))}
              className={styles.sensitivitySlider}
              style={{ background: getSliderBackground(domain.value) }}
            />

            <div className={styles.observations}>
              {domain.observations.map((obs, obsIndex) => (
                <div key={obsIndex} className={styles.observationItem}>
                  {obs}
                  <button
                    onClick={() => handleDeleteObservation(index, obsIndex)}
                    className={styles.deleteObservation}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className={styles.addObservation}>
                <input
                  type="text"
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  onFocus={() => setActiveDomain(index)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddObservation(index)}
                  placeholder="Add observation..."
                />
                <button onClick={() => handleAddObservation(index)}>Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 