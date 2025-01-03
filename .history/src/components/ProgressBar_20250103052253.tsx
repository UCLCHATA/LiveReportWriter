import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const [milestone, setMilestone] = useState<string>('');
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);

  const testConfetti = () => {
    console.log('Testing confetti...');
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '10000';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    myConfetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.6, x: 0.5 }
    }).then(() => {
      // Remove canvas after animation
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 5000);
    });
  };

  const celebrateMilestone = useCallback((currentProgress: number) => {
    const milestones = [25, 50, 75, 100];
    const crossedMilestone = milestones.find(m => 
      currentProgress >= m && 
      lastCelebrated < m
    );

    console.log('Progress:', currentProgress, 'Last Celebrated:', lastCelebrated, 'Crossed:', crossedMilestone);

    if (crossedMilestone) {
      console.log('Celebrating milestone:', crossedMilestone);
      setLastCelebrated(crossedMilestone);
      testConfetti(); // Use the same confetti function for milestones
    }
  }, [lastCelebrated]);

  useEffect(() => {
    // Update milestone class based on progress
    if (progress >= 100) {
      setMilestone('milestone100');
    } else if (progress >= 75) {
      setMilestone('milestone75');
    } else if (progress >= 50) {
      setMilestone('milestone50');
    } else if (progress >= 25) {
      setMilestone('milestone25');
    } else {
      setMilestone('');
    }

    // Trigger celebration if we hit a milestone
    celebrateMilestone(progress);
  }, [progress, celebrateMilestone]);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={`${styles.progressBar} ${milestone ? styles[milestone] : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      >
        <span className={styles.progressText}>
          {Math.round(progress)}%
        </span>
      </div>
      <button 
        onClick={testConfetti}
        style={{
          position: 'absolute',
          right: '-120px',
          top: 0,
          padding: '4px 8px',
          fontSize: '12px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Confetti
      </button>
    </div>
  );
}; 