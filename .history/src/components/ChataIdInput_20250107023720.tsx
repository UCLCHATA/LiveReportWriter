import React, { useRef, useState, useEffect } from 'react';
import styles from './ClinicianModal.module.css';

interface ChataIdInputProps {
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export const ChataIdInput: React.FC<ChataIdInputProps> = ({ onChange, onSubmit }) => {
  const [segments, setSegments] = useState(['', '', '']); // [prefix, childCode, number]
  const [fullChataId, setFullChataId] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    // Only auto-submit when all segments are complete and valid
    if (isComplete && fullChataId.length === 11) { // Ensure we have the complete ID (XXX-XXX-NNN format)
      console.log('ChataIdInput: Auto-submitting complete ID:', fullChataId);
      onSubmit(fullChataId);
    }
  }, [isComplete, fullChataId, onSubmit]);

  const handleSegmentChange = (index: number, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = value.toUpperCase();
    
    // Update segments and compute full CHATA ID
    const newFullChataId = newSegments.join('-');
    const newIsComplete = newSegments.every((segment, idx) => 
      segment.length === (idx === 2 ? 3 : 3) // Last segment should be 3 digits
    );
    
    console.log('ChataIdInput: Segment update:', {
      index,
      value,
      newSegments,
      newFullChataId,
      newIsComplete
    });
    
    setSegments(newSegments);
    setFullChataId(newFullChataId);
    setIsComplete(newIsComplete);
  };

  const handleSubmit = () => {
    // Only submit if all segments are complete
    if (segments.every(segment => segment.length === 3)) {
      const fullChataId = segments.join('-');
      console.log('ChataIdInput: Submitting:', { segments, fullChataId });
      onChange(fullChataId);
      onSubmit(fullChataId);
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
        onBlur={() => handleSubmit()}
        placeholder="123"
        className={styles.segment}
      />
    </div>
  );
}; 