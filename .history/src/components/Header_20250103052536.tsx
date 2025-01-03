import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
    progress?: number;
}

export const Header: React.FC<HeaderProps> = ({ chataId, progress = 0 }) => {
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
        }) as (options: confetti.Options) => Promise<null>;

        if (myConfetti) {
            myConfetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6, x: 0.5 }
            }).then(() => {
                setTimeout(() => {
                    document.body.removeChild(canvas);
                }, 5000);
            });
        }
    };

    useEffect(() => {
        const milestones = [25, 50, 75, 100];
        const crossedMilestone = milestones.find(m => 
            progress >= m && 
            lastCelebrated < m
        );

        console.log('Progress:', progress, 'Last Celebrated:', lastCelebrated, 'Crossed:', crossedMilestone);

        if (crossedMilestone) {
            console.log('Celebrating milestone:', crossedMilestone);
            setLastCelebrated(crossedMilestone);
            testConfetti();
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
                </div>
                <div className={styles.chataId}>
                    <span>CHATA ID:</span>
                    <span className={styles.idText}>{chataId}</span>
                </div>
            </div>
        </header>
    );
}; 