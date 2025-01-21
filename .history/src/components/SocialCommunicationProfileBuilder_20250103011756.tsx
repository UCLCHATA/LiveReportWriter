import React from 'react';
import { SocialCommunicationGraph, SocialCommunicationProfile } from './SocialCommunicationProfile';
import styles from './SocialCommunicationProfile.module.css';

interface SocialCommunicationProfileBuilderProps {
  data: {
    domains: Record<string, {
      name: string;
      value: number;
      observations: string[];
      label: 'Age Appropriate' | 'Subtle Differences' | 'Emerging' | 'Limited' | 'Significantly Limited';
    }>;
  };
  onChange: (data: any) => void;
}

export const SocialCommunicationProfileBuilder: React.FC<SocialCommunicationProfileBuilderProps> = ({ data, onChange }) => {
  return (
    <div className={styles.profileContainer}>
      <SocialCommunicationGraph data={data} />
      <SocialCommunicationProfile data={data} onChange={onChange} />
    </div>
  );
}; 