import React from 'react';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC<{ onCreateReport: () => void }> = ({ onCreateReport }) => {
  const handleDownloadTemplate = () => {
    window.open('https://docs.google.com/document/d/1FrB47q-LB5T5z1F3sk-j84bwoPM90LOvrN8CJzdwBPQ/edit?tab=t.0#heading=h.gjdgxs', '_blank');
  };

  return (
    <div className={styles.container}>
      <button className={styles.createButton} onClick={onCreateReport}>
        Create Report
      </button>
      <button className={styles.downloadButton} onClick={handleDownloadTemplate}>
        Download Template
      </button>
    </div>
  );
}; 