import React from 'react';
import styles from './Overlay.module.css';

const TUTORIAL_URL = 'https://drive.google.com/file/d/1FILtDAm3mrjEDYWrmwpqNvMx-F2D8KrS/view?usp=sharing';

interface OverlayProps {
  onCreateReport: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ onCreateReport }) => {
  const openTutorial = () => {
    window.open(TUTORIAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.buttonGroup}>
        <button 
          className={styles.createReportButton}
          onClick={onCreateReport}
        >
          Create Report
        </button>
        <button 
          className={`${styles.button} ${styles.tutorialButton}`}
          onClick={openTutorial}
        >
          Tutorial
        </button>
      </div>
    </div>
  );
}; 