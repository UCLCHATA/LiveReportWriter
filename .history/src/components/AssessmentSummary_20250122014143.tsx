import React, { useRef } from 'react';
import { CombinedRadarGraph } from './CombinedRadarGraph';
import styles from './AssessmentSummary.module.css';
import type { GlobalFormState } from '../types';
import html2canvas from 'html2canvas';

interface AssessmentSummaryProps {
  data: GlobalFormState['assessments'];
  onChange: (data: any) => void;
  chataId: string;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ data, onChange, chataId }) => {
  const graphRef = useRef<HTMLDivElement>(null);

  const handleDownloadClick = async () => {
    if (!graphRef.current) return;

    try {
      const canvas = await html2canvas(graphRef.current, {
        scale: 0.75,
        logging: false,
        useCORS: true,
        backgroundColor: null
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ASD Profile_${chataId}.png`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'image/png');

      // Show dialog
      alert('Please add this ASD profile image to the template after you receive the generated report in editable word doc form.');
    } catch (error) {
      console.error('Failed to capture radar chart:', error);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.includeButton}
        onClick={handleDownloadClick}
      >
        Download ASD Profile
      </button>
      <div ref={graphRef}>
        <CombinedRadarGraph
          sensoryData={data?.sensoryProfile}
          socialData={data?.socialCommunication}
          behaviorData={data?.behaviorInterests}
        />
      </div>
    </div>
  );
};

export default AssessmentSummary; 