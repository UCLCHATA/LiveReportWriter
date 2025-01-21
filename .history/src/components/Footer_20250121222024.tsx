import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogos}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png" 
            alt="UCL Logo" 
            className={`${styles.footerLogo} ${styles.uclLogo}`} 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png" 
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