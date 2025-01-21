import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import styles from './ProgressBar.module.css';
export const ProgressBar = ({ progress }) => {
    const [milestone, setMilestone] = useState('');
    const [lastCelebrated, setLastCelebrated] = useState(0);
    const celebrateMilestone = useCallback((currentProgress) => {
        const milestone = Math.floor(currentProgress / 25) * 25;
        if (milestone > lastCelebrated && milestone >= 25) {
            setLastCelebrated(milestone);
            switch (milestone) {
                case 25:
                    // Simple confetti burst
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    break;
                case 50:
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
                    break;
                case 75:
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
                    break;
                case 100:
                    // Grand finale
                    const duration = 3000;
                    const animationEnd = Date.now() + duration;
                    (function frame() {
                        const timeLeft = animationEnd - Date.now();
                        const particleCount = 50 * (timeLeft / duration);
                        confetti({
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
        }
        else if (progress >= 75) {
            setMilestone('milestone75');
        }
        else if (progress >= 50) {
            setMilestone('milestone50');
        }
        else if (progress >= 25) {
            setMilestone('milestone15');
        }
        else {
            setMilestone('');
        }
        // Trigger celebration if we hit a milestone
        celebrateMilestone(progress);
    }, [progress, celebrateMilestone]);
    return (_jsx("div", { className: styles.progressContainer, children: _jsx("div", { className: `${styles.progressBar} ${milestone ? styles[milestone] : ''}`, style: { width: `${Math.min(100, Math.max(0, progress))}%` }, children: _jsxs("span", { className: styles.progressText, children: [Math.round(progress), "%"] }) }) }));
};
