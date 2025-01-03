import React, { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const [milestone, setMilestone] = useState<string>('');

  useEffect(() => {
    // Update milestone class based on progress
    if (progress >= 100) {
      setMilestone('milestone100');
    } else if (progress >= 75) {
      setMilestone('milestone75');
    } else if (progress >= 50) {
      setMilestone('milestone50');
    } else if (progress >= 15) {
      setMilestone('milestone15');
    } else {
      setMilestone('');
    }
  }, [progress]);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={`${styles.progressBar} ${milestone ? styles[milestone] : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      >
        <span className={styles.progressText}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}; 