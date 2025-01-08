import React, { useRef, useState } from 'react';
import styles from './ClinicianModal.module.css';

interface ChataIdInputProps {
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChataIdInput: React.FC<ChataIdInputProps> = ({ onChange, onSubmit }) => {
  const [segments, setSegments] = useState(['', '', '']); // [prefix, childCode, number]
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleSegmentChange = (index: number, value: string) => {
    const newValue = value.toUpperCase();
    const newSegments = [...segments];
    newSegments[index] = newValue;
    setSegments(newSegments);

    // Combine segments with hyphens and trigger onChange
    const fullChataId = newSegments.join('-');
    console.log('ChataIdInput: Segments changed:', { segments: newSegments, fullChataId });
    onChange(fullChataId);

    // Auto-advance to next segment if current is full
    if (index < 2 && newValue.length === 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all segments are complete and valid
    if (segments[0].length === 3 && segments[1].length === 3 && 
        index === 2 && newValue.length === 3) {
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        const finalId = `${segments[0]}-${segments[1]}-${newValue}`;
        onChange(finalId);
        onSubmit();
      }, 0);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !segments[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className={styles.segmentedInput}>
      <input
        ref={inputRefs[0]}
        type="text"
        maxLength={3}
        value={segments[0]}
        onChange={(e) => handleSegmentChange(0, e.target.value)}
        onKeyDown={(e) => handleKeyDown(0, e)}
        placeholder="XXX"
        className={styles.segment}
      />
      <span className={styles.separator}>-</span>
      <input
        ref={inputRefs[1]}
        type="text"
        maxLength={3}
        value={segments[1]}
        onChange={(e) => handleSegmentChange(1, e.target.value)}
        onKeyDown={(e) => handleKeyDown(1, e)}
        placeholder="XXX"
        className={styles.segment}
      />
      <span className={styles.separator}>-</span>
      <input
        ref={inputRefs[2]}
        type="text"
        maxLength={3}
        value={segments[2]}
        onChange={(e) => handleSegmentChange(2, e.target.value)}
        onKeyDown={(e) => handleKeyDown(2, e)}
        placeholder="123"
        className={styles.segment}
      />
    </div>
  );
}; 