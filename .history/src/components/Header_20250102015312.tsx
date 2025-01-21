import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
    progress?: number;
}

export const Header: React.FC<HeaderProps> = ({ chataId, progress = 0 }) => {
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
                            title={`Form completion: ${progress}%`}
                        >
                            <span className={styles.progressText}>{progress}%</span>
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