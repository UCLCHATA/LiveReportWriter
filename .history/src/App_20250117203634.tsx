import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './hooks/useFormState';
import './styles/main.css';
import type { ClinicianInfo } from './types/index';

export const App: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isChataIdDialogOpen, setIsChataIdDialogOpen] = useState(false);
  const { globalState, clearState } = useFormState();

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleClearForm = () => {
    clearState();
  };

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    // Handle clinician info submission
    console.log('Clinician info submitted:', info);
  };

  return (
    <div className="app">
      <Header 
        chataId={globalState?.chataId || ''}
        progress={progress}
        isChataIdDialogOpen={isChataIdDialogOpen}
      />
      <main>
        <AssessmentCarousel 
          onProgressUpdate={handleProgressUpdate}
          initialProgress={progress}
        />
        <AssessmentForm 
          onClear={handleClearForm}
          onProgressUpdate={handleProgressUpdate}
          initialProgress={progress}
        />
      </main>
      <ClinicianModal 
        isOpen={isChataIdDialogOpen}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setIsChataIdDialogOpen(false)}
        onChataIdDialogChange={setIsChataIdDialogOpen}
      />
    </div>
  );
}; 