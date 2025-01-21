import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
    progress?: number;
}

export const Header: React.FC<HeaderProps> = ({ chataId, progress = 0 }) => {
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
        <header className={styles.siteHeader}>
            <div className={styles.headerContent}>
                <img 
                    className={`${styles.headerLogo} ${styles.ucl}`}
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png" 
                    alt="UCL Logo" 
                />
                <h1>CHATA Autism Report Generator</h1>
                <div className={styles.headerRight}>
                    <div className={styles.progressContainer}>
                        <div 
                            className={styles.progressBar} 
                            style={{ width: `${progress}%` }}
                        >
                            <span className={styles.progressText}>{progress}%</span>
                        </div>
                        <div className={styles.progressTooltip}>
                            <pre>{getProgressBreakdown()}</pre>
                        </div>
                    </div>
                    {chataId && <span className={styles.chataId}>{chataId}</span>}
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