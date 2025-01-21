import React from 'react';
import { testImageUpload } from '../utils/imageUpload';

export const ImageUploadTest: React.FC = () => {
  const handleTestRadarUpload = async () => {
    const radarElement = document.querySelector('.recharts-wrapper');
    if (radarElement) {
      await testImageUpload(radarElement as HTMLElement, 'TEST123', 'radar');
    } else {
      console.error('Radar chart element not found');
    }
  };

  const handleTestMilestoneUpload = async () => {
    const timelineElement = document.querySelector('.timelineWrapper');
    if (timelineElement) {
      await testImageUpload(timelineElement as HTMLElement, 'TEST123', 'milestone');
    } else {
      console.error('Timeline element not found');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={handleTestRadarUpload}>
        Test Radar
      </button>
      <button onClick={handleTestMilestoneUpload}>
        Test Timeline
      </button>
    </div>
  );
}; 