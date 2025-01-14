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
    <div style={{ padding: '20px' }}>
      <h3>Image Upload Test</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleTestRadarUpload}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Radar Chart Upload
        </button>
        <button 
          onClick={handleTestMilestoneUpload}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Milestone Timeline Upload
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>Check the console for upload progress and results</p>
      </div>
    </div>
  );
}; 