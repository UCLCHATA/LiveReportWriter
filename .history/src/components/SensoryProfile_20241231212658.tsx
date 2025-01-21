import React from 'react';
import styles from './CarouselHeader.module.css';

export const SensoryProfile: React.FC = () => {
  return (
    <div>
      <header className={styles.carouselHeader}>
        <button className={styles.navButton}>
          <span>←</span>
        </button>
        
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Sensory Profile</h2>
          <button className={styles.toolkitButton}>
            <span>ℹ️</span>
            <span>Toolkit</span>
          </button>
        </div>

        <div className={styles.carouselIndicators}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div 
              key={index} 
              className={`${styles.indicator} ${index === 0 ? styles.active : ''}`}
            />
          ))}
        </div>

        <button className={styles.navButton}>
          <span>→</span>
        </button>
      </header>

      {/* Rest of the component content */}
    </div>
  );
}; 