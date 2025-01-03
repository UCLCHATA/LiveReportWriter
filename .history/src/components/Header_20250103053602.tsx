import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
    progress?: number;
}

export const Header: React.FC<HeaderProps> = ({ chataId, progress = 0 }) => {
    const [lastCelebrated, setLastCelebrated] = useState<number>(0);

    const celebrate25 = () => {
        // Simple burst
        confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.6, x: 0.5 },
            colors: ['#818cf8', '#6366f1']
        });
    };

    const celebrate50 = () => {
        // Double burst with different colors
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#818cf8', '#6366f1']
        });
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#818cf8', '#6366f1']
            });
        }, 250);
    };

    const celebrate75 = () => {
        // School pride effect
        const end = Date.now() + 1000;
        const colors = ['#4f46e5', '#818cf8'];
        
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: colors
            });
            confetti({
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
    };

    const celebrate100 = () => {
        // Grand finale
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        let frame = 0;
        
        (function shoot() {
            // Launch fireworks from both sides
            confetti({
                particleCount: 10,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#10b981', '#34d399', '#059669'],
                startVelocity: 45,
                gravity: 1.2,
                drift: 0,
                ticks: 300
            });
            confetti({
                particleCount: 10,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#10b981', '#34d399', '#059669'],
                startVelocity: 45,
                gravity: 1.2,
                drift: 0,
                ticks: 300
            });

            // Center burst every few frames
            if (frame % 3 === 0) {
                confetti({
                    particleCount: 30,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#059669', '#047857'],
                    startVelocity: 30,
                    gravity: 0.8,
                    scalar: 1.2,
                    drift: 0
                });
            }
            
            frame++;
            
            if (Date.now() < animationEnd) {
                requestAnimationFrame(shoot);
            }
        }());
    };

    const testConfetti = () => {
        console.log('Testing confetti...');
        celebrate100();
    };

    useEffect(() => {
        const roundedProgress = Math.round(progress);
        console.log('Rounded Progress:', roundedProgress);
        
        // Only celebrate each milestone once
        if (roundedProgress === 25 && lastCelebrated < 25) {
            console.log('25% milestone reached!');
            setLastCelebrated(25);
            celebrate25();
        } else if (roundedProgress === 50 && lastCelebrated < 50) {
            console.log('50% milestone reached!');
            setLastCelebrated(50);
            celebrate50();
        } else if (roundedProgress === 75 && lastCelebrated < 75) {
            console.log('75% milestone reached!');
            setLastCelebrated(75);
            celebrate75();
        } else if (roundedProgress === 100 && lastCelebrated < 100) {
            console.log('100% milestone reached!');
            setLastCelebrated(100);
            celebrate100();
        }
    }, [progress, lastCelebrated]);

    const getProgressState = (progress: number): 'low' | 'medium' | 'high' | 'complete' => {
        if (progress >= 95) return 'complete';
        if (progress >= 70) return 'high';
        if (progress >= 40) return 'medium';
        return 'low';
    };

    const getProgressBreakdown = () => {
        return `Form Completion Progress:

Right Side (50%):
• Text Boxes (40%):
  - Clinical Observations (10%)
  - Strengths & Abilities (10%)
  - Priority Support Areas (10%)
  - Support Recommendations (10%)
• Status Fields (5%):
  - ASC Status (2.5%)
  - ADHD Status (2.5%)
• Professional Referrals (5%)

Left Side (50%):
• Sensory Profile (10%)
• Social Communication (10%)
• Behavior & Interests (10%)
• Milestone Tracker (10%)
• Assessment Log (10%)

Total Progress: ${progress}%`;
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>CHATA</span>
                    <span className={styles.logoSubtext}>Comprehensive Health Assessment Tool for Autism</span>
                </div>
                <div className={styles.progressSection}>
                    <div className={styles.progressContainer}>
                        <div 
                            className={styles.progressBar}
                            data-progress={getProgressState(progress)}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        >
                            <span className={styles.progressText}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className={styles.progressTooltip}>
                            <pre>{getProgressBreakdown()}</pre>
                        </div>
                    </div>
                    <button 
                        onClick={testConfetti}
                        style={{
                            marginLeft: '10px',
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
                <div className={styles.chataId}>
                    <span>CHATA ID:</span>
                    <span className={styles.idText}>{chataId}</span>
                </div>
            </div>
        </header>
    );
}; 