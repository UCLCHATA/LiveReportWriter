import React from 'react';
import styles from './LandingPage.module.css';

const TUTORIAL_URL = 'https://drive.google.com/file/d/1FILtDAm3mrjEDYWrmwpqNvMx-F2D8KrS/view?usp=sharing';

export const LandingPage: React.FC<{ onCreateReport: () => void }> = ({ onCreateReport }) => {
  const handleDownloadTemplate = () => {
    window.open('https://docs.google.com/document/d/1FrB47q-LB5T5z1F3sk-j84bwoPM90LOvrN8CJzdwBPQ/edit?tab=t.0#heading=h.gjdgxs', '_blank');
  };

  const openTutorial = () => {
    window.open(TUTORIAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={styles.createButton} onClick={onCreateReport}>
          Create Report
        </button>
        <button className={styles.downloadButton} onClick={handleDownloadTemplate}>
          Download Template
        </button>
        <button className={styles.tutorialButton} onClick={openTutorial}>
          Tutorial
        </button>
      </div>
    </div>
  );
}; 