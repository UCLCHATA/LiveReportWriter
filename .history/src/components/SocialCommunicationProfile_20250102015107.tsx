import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './SocialCommunicationProfile.module.css';

interface Domain {
  name: string;
  value: number;
  observations: string[];
  label: 'Age Appropriate' | 'Subtle Differences' | 'Emerging' | 'Limited' | 'Significantly Limited';
}

const getSensitivityLabel = (value: number): 'Age Appropriate' | 'Subtle Differences' | 'Emerging' | 'Limited' | 'Significantly Limited' => {
  switch (value) {
    case 1: return 'Age Appropriate';
    case 2: return 'Subtle Differences';
    case 3: return 'Emerging';
    case 4: return 'Limited';
    case 5: return 'Significantly Limited';
    default: return 'Emerging';
  }
};

const getDomainTooltip = (domain: string): string => {
  switch (domain) {
    case 'Joint Attention':
      return 'DSM-5 A.1 & ICF b122:\n• Social-emotional reciprocity\n• Initiation of social interaction\n• Sharing of interests/emotions\n• Response to social approaches\n• Psychosocial functions';
    case 'Social Reciprocity':
      return 'DSM-5 A.1 & ICF d710:\n• Back-and-forth communication\n• Emotional engagement\n• Social imitation skills\n• Basic interpersonal interactions\n• Relationship maintenance';
    case 'Verbal Communication':
      return 'DSM-5 A.2 & ICF b167:\n• Expressive language skills\n• Conversation abilities\n• Language pragmatics\n• Mental functions of language\n• Speech patterns/prosody';
    case 'Non-verbal Communication':
      return 'DSM-5 A.2 & ICF b1671:\n• Gesture use and understanding\n• Facial expression range\n• Eye contact quality\n• Expression of language\n• Body language interpretation';
    case 'Social Understanding':
      return 'DSM-5 A.3 & ICF d720:\n• Relationship comprehension\n• Social context adaptation\n• Complex social interactions\n• Social inference abilities\n• Boundary awareness';
    case 'Play Skills':
      return 'DSM-5 A.3 & ICF d880:\n• Imaginative play development\n• Symbolic play abilities\n• Social play engagement\n• Engagement in play\n• Play flexibility';
    default:
      return 'Rate social communication abilities in this domain';
  }
};

export const SocialCommunicationProfile: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([
    { name: 'Joint Attention', value: 1, observations: [], label: 'Significantly Limited' },
    { name: 'Social Reciprocity', value: 1, observations: [], label: 'Significantly Limited' },
    { name: 'Verbal Communication', value: 1, observations: [], label: 'Significantly Limited' },
    { name: 'Non-verbal Communication', value: 1, observations: [], label: 'Significantly Limited' },
    { name: 'Social Understanding', value: 1, observations: [], label: 'Significantly Limited' },
    { name: 'Play Skills', value: 1, observations: [], label: 'Significantly Limited' },
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
                  {getDomainTooltip(domain.name)}
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