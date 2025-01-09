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
  const [milestone, setMilestone] = React.useState<number | null>(null);

  const getProgressState = (progress: number): 'low' | 'medium' | 'high' | 'complete' => {
    if (progress >= 95) return 'complete';
    if (progress >= 70) return 'high';
    if (progress >= 40) return 'medium';
    return 'low';
  };

  // Handle milestone detection
  React.useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => progress >= m && progress < m + 5);
    
    if (currentMilestone) {
      setMilestone(currentMilestone);
      // Reset milestone after animation
      const timer = setTimeout(() => {
        setMilestone(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

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
                data-milestone={milestone}
              >
                <span className={styles.progressText}>{progress}%</span>
              </div>
            </div>
            {chataId && (
              <div className={`${styles.chataIdDisplay} ${isChataIdDialogOpen ? styles.pulsing : ''}`}>
                <span className={styles.chataIdLabel}>CHATA ID:</span>
                <span className={styles.chataIdValue}>{chataId}</span>
              </div>
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