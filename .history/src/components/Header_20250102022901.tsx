import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
    progress?: number;
}

export const Header: React.FC<HeaderProps> = ({ chataId, progress = 0 }) => {
    const getProgressClass = (value: number): string => {
        if (value >= 95) return 'complete';
        if (value >= 70) return 'high';
        if (value >= 40) return 'medium';
        return 'low';
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <img 
                    className={styles.logo}
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png" 
                    alt="UCL Logo" 
                />
                <h1 className={styles.title}>Autism Report Generator</h1>
            </div>
            <div className={styles.headerRight}>
                <div className={styles.progressContainer}>
                    <div 
                        className={`${styles.progressBar} ${styles[getProgressClass(progress)]}`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    >
                        {Math.round(progress)}%
                    </div>
                </div>
                <div className={styles.chataId}>
                    CHATA ID: {chataId}
                </div>
                <img 
                    className={styles.headerLogo}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png" 
                    alt="NHS Logo" 
                />
            </div>
        </header>
    );
}; 