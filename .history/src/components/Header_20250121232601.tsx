import React from 'react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';
import modalStyles from './ClinicianModal.module.css';
import { debounce } from 'lodash';

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
  const [displayProgress, setDisplayProgress] = React.useState(Math.round(progress));

  const getProgressState = (progress: number): 'low' | 'medium' | 'high' | 'complete' => {
    if (progress >= 95) return 'complete';
    if (progress >= 70) return 'high';
    if (progress >= 40) return 'medium';
    return 'low';
  };

  // Update display progress with debounce
  React.useEffect(() => {
    const debouncedUpdate = debounce((newProgress: number) => {
      setDisplayProgress(Math.round(newProgress));
    }, 300);

    debouncedUpdate(progress);
    return () => debouncedUpdate.cancel();
  }, [progress]);

  // Handle milestone detection
  React.useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => displayProgress >= m && displayProgress < m + 5);
    
    if (currentMilestone) {
      setMilestone(currentMilestone);
      // Reset milestone after animation
      const timer = setTimeout(() => {
        setMilestone(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [displayProgress]);

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
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            CHATA{' '}
            <motion.span
              className={styles.liveText}
              initial={{ color: '#4f46e5' }}
              animate={{ color: '#6366f1' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              Live
            </motion.span>{' '}
            Autism Report Generator
          </motion.h1>
          <div className={styles.metricsContainer}>
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${displayProgress}%` }}
                data-progress={getProgressState(displayProgress)}
                data-milestone={milestone}
              >
                <span className={styles.progressText}>{displayProgress}%</span>
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