import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const [milestone, setMilestone] = useState<string>('');
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const myConfetti = useRef<any>(null);

  useEffect(() => {
    // Create canvas for confetti
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
      myConfetti.current = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      // Test confetti
      console.log('Testing confetti with new canvas...');
      myConfetti.current({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    return () => {
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, []);

  const celebrateMilestone = useCallback((currentProgress: number) => {
    if (!myConfetti.current) return;

    const milestones = [25, 50, 75, 100];
    const crossedMilestone = milestones.find(m => 
      currentProgress >= m && 
      lastCelebrated < m
    );

    console.log('Progress:', currentProgress, 'Last Celebrated:', lastCelebrated, 'Crossed:', crossedMilestone);

    if (crossedMilestone) {
      console.log('Celebrating milestone:', crossedMilestone);
      setLastCelebrated(crossedMilestone);
      
      switch (crossedMilestone) {
        case 25:
          console.log('Triggering 25% celebration');
          myConfetti.current({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          break;
        
        case 50:
          console.log('Triggering 50% celebration');
          myConfetti.current({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#818cf8', '#6366f1']
          });
          setTimeout(() => {
            myConfetti.current({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#4f46e5', '#818cf8', '#6366f1']
            });
          }, 250);
          break;
        
        case 75:
          console.log('Triggering 75% celebration');
          const end = Date.now() + 1000;
          const colors = ['#4f46e5', '#818cf8'];
          
          (function frame() {
            myConfetti.current({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.6 },
              colors: colors
            });
            myConfetti.current({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.6 },
              colors: colors
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 100:
          console.log('Triggering 100% celebration');
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          
          (function frame() {
            const timeLeft = animationEnd - Date.now();
            
            const particleCount = 50 * (timeLeft / duration);
            myConfetti.current({
              particleCount,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#059669', '#047857'],
              startVelocity: 30,
              gravity: 0.8,
              scalar: 1.2,
              drift: 0
            });
            
            if (timeLeft > 0) {
              requestAnimationFrame(frame);
            }
          }());
          break;
      }
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
    </div>
  );
}; 