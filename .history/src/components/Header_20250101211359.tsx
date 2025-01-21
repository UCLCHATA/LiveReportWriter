import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    chataId: string;
}

export const Header: React.FC<HeaderProps> = ({ chataId }) => {
    return (
        <header className={styles.header}>
            <div className={styles.mainRow}>
                <div className={styles.logoContainer}>
                    <img src="/ucl-logo.png" alt="UCL Logo" className={styles.logo} />
                    <h1 className={styles.title}>CHATA Autism Report Generator</h1>
                    <img src="/nhs-logo.png" alt="NHS Logo" className={styles.logo} />
                </div>
            </div>
            <div className={styles.chataId}>{chataId}</div>
        </header>
    );
}; 