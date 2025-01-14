import React, { useEffect } from 'react';
import { testImageUpload } from '../utils/imageUpload';

export const ImageUploadTest: React.FC = () => {
  const testUploads = async () => {
    console.log('🔄 Starting automatic image upload test...');
    
    // Test radar chart upload
    console.log('📊 Looking for radar chart element...');
    const radarElement = document.querySelector('.recharts-wrapper');
    if (radarElement) {
      console.log('✅ Found radar chart element, starting upload...');
      await testImageUpload(radarElement as HTMLElement, 'TEST123', 'radar');
    } else {
      console.error('❌ Radar chart element not found. Make sure you are on a page with the radar chart visible.');
    }

    // Test milestone timeline upload
    console.log('📅 Looking for timeline element...');
    const timelineElement = document.querySelector('.timelineWrapper');
    if (timelineElement) {
      console.log('✅ Found timeline element, starting upload...');
      await testImageUpload(timelineElement as HTMLElement, 'TEST123', 'milestone');
    } else {
      console.error('❌ Timeline element not found. Make sure you are on a page with the timeline visible.');
    }
  };

  useEffect(() => {
    console.log('🚀 ImageUploadTest component mounted');
    // Small delay to ensure elements are rendered
    const timer = setTimeout(() => {
      testUploads();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Image Upload Test</h3>
      <div style={{ marginTop: '20px' }}>
        <p>Check the console for upload progress and results</p>
        <p>Status: Automatically testing uploads on page load...</p>
      </div>
    </div>
  );
}; 