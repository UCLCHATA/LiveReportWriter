import React, { useState, useCallback, useEffect } from 'react';
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

  // Handle global state changes
  useEffect(() => {
    if (globalState) {
      // If we have state but no progress, initialize from saved state
      if (progress === 0) {
        setProgress(globalState.formData.formProgress || 0);
      }
    } else {
      setProgress(0);
      setShowModal(false);
      setIsChataIdDialogOpen(false);
    }
  }, [globalState, progress]);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleClearForm = useCallback(() => {
    clearState();
  }, [clearState]);

  const handleCreateReport = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleClinicianSubmit = useCallback((info: ClinicianInfo) => {
    console.log('Submitting clinician info:', info);
    
    // Set clinician info first
    setClinicianInfo(info);
    
    // Close modal after state is updated
    setShowModal(false);
    
    // Show CHATA ID dialog for new forms
    if (!info.chataId) {
      setTimeout(() => {
        setIsChataIdDialogOpen(true);
      }, 0);
    }
  }, [setClinicianInfo]);

  // Show form if we have any state at all
  const shouldShowForm = !!globalState;

  return (
    <div className="app">
      <Header 
        chataId={globalState?.chataId || ''}
        progress={progress}
        isChataIdDialogOpen={isChataIdDialogOpen}
      />
      {shouldShowForm ? (
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