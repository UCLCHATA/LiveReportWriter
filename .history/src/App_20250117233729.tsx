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
      // Reset all UI state when global state is cleared
      setProgress(0);
      setShowModal(false);
      setIsChataIdDialogOpen(false);
    }
  }, [globalState, progress]);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleClearForm = useCallback(() => {
    // First reset UI state
    setProgress(0);
    setShowModal(false);
    setIsChataIdDialogOpen(false);
    
    // Then clear global state
    clearState();
    
    // Force URL update
    const url = new URL(window.location.href);
    url.searchParams.delete('chataId');
    window.history.replaceState({}, '', url.toString());
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

  // Only show form if we have valid state with a CHATA ID
  const shouldShowForm = globalState?.chataId && globalState?.clinician?.name;

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