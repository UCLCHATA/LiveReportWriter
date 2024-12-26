import React, { useState } from 'react';

type SensoryDomain = {
  name: string;
  value: number;
  notes: string;
  label: 'Under-responsive' | 'Over-responsive';
};

export const SensoryProfileBuilder: React.FC = () => {
  const [domains, setDomains] = useState<SensoryDomain[]>([
    { name: 'Visual', value: 50, notes: '', label: 'Under-responsive' },
    { name: 'Auditory', value: 50, notes: '', label: 'Over-responsive' },
    { name: 'Tactile', value: 50, notes: '', label: 'Over-responsive' },
    { name: 'Vestibular', value: 50, notes: '', label: 'Under-responsive' },
    { name: 'Proprioceptive', value: 50, notes: '', label: 'Under-responsive' },
  ]);

  const handleSliderChange = (index: number, value: number) => {
    const newDomains = [...domains];
    newDomains[index].value = value;
    setDomains(newDomains);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const newDomains = [...domains];
    newDomains[index].notes = notes;
    setDomains(newDomains);
  };

  return (
    <div className="sensory-profile">
      <h2>Sensory Profile</h2>
      {domains.map((domain, index) => (
        <div key={domain.name} className="sensory-slider">
          <div className="sensory-slider-label">
            <span>{domain.name}</span>
            <span>{domain.label}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={domain.value}
            onChange={(e) => handleSliderChange(index, Number(e.target.value))}
          />
          <input
            type="text"
            className="sensory-notes"
            placeholder="Add observation..."
            value={domain.notes}
            onChange={(e) => handleNotesChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}; 