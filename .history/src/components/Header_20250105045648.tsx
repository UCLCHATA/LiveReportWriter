import React from 'react';
import styles from './Header.module.css';
import modalStyles from './ClinicianModal.module.css';

interface HeaderProps {
  chataId: string;
  progress?: number;
  isChataIdDialogOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  chataId, 
  progress = 0,
  isChataIdDialogOpen = false 
}) => {
  const getProgressState = (progress: number): 'low' | 'medium' | 'high' | 'complete' => {
    if (progress >= 95) return 'complete';
    if (progress >= 70) return 'high';
    if (progress >= 40) return 'medium';
    return 'low';
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerContent}>
        <div className={`${styles.logoContainer} ${styles.left}`}>
          <img 
            className={`${styles.headerLogo} ${styles.ucl}`}
            src="https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png" 
            alt="UCL Logo" 
          />
        </div>
        <div className={styles.centerContent}>
          <h1>CHATA Autism Report Generator</h1>
          <div className={styles.metricsContainer}>
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${progress}%` }}
                data-progress={getProgressState(progress)}
              >
                <span className={styles.progressText}>{progress}%</span>
              </div>
            </div>
            {chataId && (
              <span 
                className={`${modalStyles.headerChataId} ${isChataIdDialogOpen ? modalStyles.pulsingChataId : ''}`}
                key={`${chataId}-${isChataIdDialogOpen}`}
              >
                {chataId}
              </span>
            )}
          </div>
        </div>
        <div className={`${styles.logoContainer} ${styles.right}`}>
          <img 
            className={styles.headerLogo}
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png" 
            alt="NHS Logo" 
          />
        </div>
      </div>
    </header>
  );
}; 