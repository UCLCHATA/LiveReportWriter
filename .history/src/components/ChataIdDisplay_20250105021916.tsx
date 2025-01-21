import React from 'react';
import styles from './ChataIdDisplay.module.css';

interface ChataIdDisplayProps {
  chataId: string | null;
  isBlinking?: boolean;
}

export const ChataIdDisplay: React.FC<ChataIdDisplayProps> = ({ 
  chataId,
  isBlinking = false
}) => {
  if (!chataId) return null;

  return (
    <div className={`${styles.container} ${isBlinking ? styles.blinking : ''}`}>
      <span className={styles.label}>CHATA ID:</span>
      <span className={styles.id}>{chataId}</span>
    </div>
  );
}; 