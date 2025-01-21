import React from 'react';
import styles from './ClinicianModal.module.css';

interface HeaderProps {
  chataId: string | null;
}

export const Header: React.FC<HeaderProps> = ({ chataId }) => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>CHATA Autism Report Generator</div>
      {chataId && (
        <div className={styles.headerChataId}>
          {chataId}
        </div>
      )}
    </div>
  );
}; 