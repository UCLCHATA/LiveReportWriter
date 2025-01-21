import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './hooks/useFormState';
import styles from './App.module.css';

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

  return (
    <div className={styles.app}>
      <Header 
        chataId={globalState.chataId}
        progress={progress}
        isChataIdDialogOpen={isChataIdDialogOpen}
      />
      <div className={styles.content}>
        <AssessmentCarousel 
          onProgressUpdate={handleProgressUpdate}
          initialProgress={progress}
        />
        <AssessmentForm 
          onClear={handleClearForm}
          onProgressUpdate={handleProgressUpdate}
          initialProgress={progress}
        />
      </div>
      <ClinicianModal 
        isOpen={isChataIdDialogOpen}
        onClose={() => setIsChataIdDialogOpen(false)}
      />
    </div>
  );
}; 