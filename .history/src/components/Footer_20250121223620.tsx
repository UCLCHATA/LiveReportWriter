import React from 'react';
import styles from './Footer.module.css';
import uclLogo from '../assets/ucl-logo.png';
import nhsLogo from '../assets/nhs-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogos}>
          <img 
            src={uclLogo}
            alt="UCL Logo" 
            className={`${styles.footerLogo} ${styles.uclLogo}`} 
          />
          <img 
            src={nhsLogo}
            alt="NHS Logo" 
            className={`${styles.footerLogo} ${styles.nhsLogo}`} 
          />
        </div>
        <div className={styles.footerText}>
          <p>© 2024 UCL & NHS. All rights reserved.</p>
          <p className={styles.contactText}>For support, please contact uclchata@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}; 