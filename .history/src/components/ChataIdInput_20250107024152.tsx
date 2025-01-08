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
    if (isComplete && segments.every(segment => segment.length === 3)) {
      const completeId = segments.join('-');
      console.log('ChataIdInput: Auto-submitting with validated ID:', completeId);
      onSubmit(completeId);
    }
  }, [isComplete, segments, onSubmit]);

  const handleSegmentChange = (index: number, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = value.toUpperCase();
    
    // Update segments and compute full CHATA ID
    const newFullChataId = newSegments.join('-');
    
    // Check if all segments are complete and valid
    const newIsComplete = newSegments.every((segment, idx) => 
      segment.length === 3 && (idx !== 2 || /^\d{3}$/.test(segment))
    );
    
    console.log('ChataIdInput: Segment update:', {
      index,
      value,
      newSegments,
      newFullChataId,
      newIsComplete,
      segmentLengths: newSegments.map(s => s.length)
    });
    
    setSegments(newSegments);
    setFullChataId(newFullChataId);
    setIsComplete(newIsComplete);

    // Only trigger onChange for complete segments
    if (newSegments[index].length === 3) {
      if (index < 2) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleSubmit = () => {
    // Only submit if all segments are complete and valid
    if (segments.every(segment => segment.length === 3)) {
      const fullId = segments.join('-');
      console.log('ChataIdInput: Manual submit with complete ID:', fullId);
      onChange(fullId);
      onSubmit(fullId);
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