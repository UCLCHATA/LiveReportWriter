import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { Overlay } from './components/Overlay';
import { useFormState } from './hooks/useFormState';
import './styles/main.css';
import type { ClinicianInfo } from './types/index';

export const App: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isChataIdDialogOpen, setIsChataIdDialogOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { globalState, clearState, setClinicianInfo } = useFormState();

  const handleProgressUpdate = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleClearForm = useCallback(() => {
    clearState();
    setProgress(0);
    setShowModal(false);
    setIsChataIdDialogOpen(false);
  }, [clearState]);

  const handleCreateReport = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleClinicianSubmit = useCallback((info: ClinicianInfo) => {
    console.log('Submitting clinician info:', info);
    setClinicianInfo(info);
    
    // Only show CHATA ID dialog for new forms
    if (!info.chataId) {
      setIsChataIdDialogOpen(true);
    }
    setShowModal(false);
  }, [setClinicianInfo]);

  return (
    <div className="app">
      <Header 
        chataId={globalState?.chataId || ''}
        progress={progress}
        isChataIdDialogOpen={isChataIdDialogOpen}
      />
      {globalState ? (
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
      ) : (
        <Overlay onCreateReport={handleCreateReport} />
      )}
      <ClinicianModal 
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
        onChataIdDialogChange={setIsChataIdDialogOpen}
      />
    </div>
  );
}; 