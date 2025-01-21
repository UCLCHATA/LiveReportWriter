import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CarouselHeader.module.css';

interface CarouselHeaderProps {
  title: string;
  isComplete?: boolean;
  onToggleComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalSteps?: number;
}

export const CarouselHeader: React.FC<CarouselHeaderProps> = ({
  title,
  isComplete = false,
  onToggleComplete,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalSteps = 5
}) => {
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'sensory profile':
        return '../assets/sensory.png';
      case 'social communication':
        return '../assets/Social.png';
      case 'behavior':
        return '../assets/behavior icon.png';
      case 'development':
        return '../assets/development icon.png';
      case 'assessment':
        return '../assets/assessment icon.png';
      default:
        return null;
    }
  };

  const iconSrc = getIcon();

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        {iconSrc && <img src={iconSrc} alt="" className={styles.componentIcon} />}
        {title}
      </div>
      
      <div className={styles.navigationSection}>
        <div className={styles.actionButtonContainer}>
          <button
            className={`${styles.actionButton} ${isComplete ? styles.complete : styles.markComplete}`}
            onClick={onToggleComplete}
          >
            {isComplete ? 'Completed' : 'Mark Complete'}
          </button>
        </div>

        <button onClick={onPrevious} className={styles.navButton}>
          <ChevronLeft size={20} />
        </button>
        
        <div className={styles.indicators}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`${styles.indicator} ${i === currentIndex ? styles.active : ''}`}
            />
          ))}
        </div>
        
        <button onClick={onNext} className={styles.navButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}; 