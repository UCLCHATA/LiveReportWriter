import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogos}>
          <img 
            src="/ucl-logo.png" 
            alt="UCL Logo" 
            className={`${styles.footerLogo} ${styles.uclLogo}`} 
          />
          <img 
            src="/nhs-logo.png" 
            alt="NHS Logo" 
            className={`${styles.footerLogo} ${styles.nhsLogo}`} 
          />
        </div>
      </div>
    </footer>
  );
}; 