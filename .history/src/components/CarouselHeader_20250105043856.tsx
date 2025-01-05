import React from 'react';
import styles from './CarouselHeader.module.css';
import { BrainCircuit, Activity, Users } from 'lucide-react';

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
        return <BrainCircuit className={styles.icon} />;
      case 'social communication':
        return <Users className={styles.icon} />;
      case 'behavior':
        return <Activity className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        {getIcon()}
        {title}
      </div>
      <button
        className={`${styles.actionButton} ${isComplete ? styles.complete : styles.markComplete}`}
        onClick={onToggleComplete}
      >
        {isComplete ? 'Completed' : 'Mark Complete'}
      </button>
    </div>
  );
}; 