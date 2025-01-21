import React from 'react';
import styles from './CarouselHeader.module.css';

interface CarouselHeaderProps {
  title: string;
  isComplete?: boolean;
  onToggleComplete?: () => void;
}

export const CarouselHeader: React.FC<CarouselHeaderProps> = ({
  title,
  isComplete = false,
  onToggleComplete
}) => {
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'sensory profile':
        return '/assets/sensory.png';
      case 'social communication':
        return '/assets/Social.png';
      case 'behavior':
        return '/assets/behavior icon.png';
      case 'development':
        return '/assets/development icon.png';
      case 'assessment':
        return '/assets/assessment icon.png';
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
      <div className={styles.actionButtonContainer}>
        <button
          className={`${styles.actionButton} ${isComplete ? styles.complete : styles.markComplete}`}
          onClick={onToggleComplete}
        >
          {isComplete ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}; 