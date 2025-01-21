import React from 'react';
import styles from './Overlay.module.css';

interface OverlayProps {
  onCreateReport: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ onCreateReport }) => {
  return (
    <div className={styles.overlay}>
      <button 
        className={styles.createReportButton}
        onClick={onCreateReport}
      >
        Create Report
      </button>
    </div>
  );
}; 