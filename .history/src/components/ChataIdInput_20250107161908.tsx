import React, { useRef, useState } from 'react';
import styles from './ClinicianModal.module.css';

interface ChataIdInputProps {
  onSubmit: (chataId: string) => void;
  error?: string;
  isLoading?: boolean;
}

export const ChataIdInput: React.FC<ChataIdInputProps> = ({ 
  onSubmit,
  error,
  isLoading = false
}) => {
  const [segments, setSegments] = useState(['', '', '']); // [clinicianCode, childCode, number]
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

    // Auto-advance to next segment
    if (index < 2 && newValue.length === 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit if complete
    if (index === 2 && newValue.length === 3 && 
        segments[0].length === 3 && segments[1].length === 3) {
      const fullChataId = newSegments.join('-');
      onSubmit(fullChataId);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !segments[index] && index > 0) {
      // Move to previous segment on backspace if current segment is empty
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
        placeholder="KOS"
        className={styles.segment}
        disabled={isLoading}
      />
      <span className={styles.separator}>-</span>
      <input
        ref={inputRefs[1]}
        type="text"
        maxLength={3}
        value={segments[1]}
        onChange={(e) => handleSegmentChange(1, e.target.value)}
        onKeyDown={(e) => handleKeyDown(1, e)}
        placeholder="JOH"
        className={styles.segment}
        disabled={isLoading}
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
        disabled={isLoading}
      />
    </div>
  );
}; 