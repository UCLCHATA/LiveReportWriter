import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
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
    if (globalState?.status === 'draft' && globalState?.chataId) {
      // Only initialize progress if we're in form input stage
      if (progress === 0) {
        setProgress(globalState.formData.formProgress || 0);
      }
    } else {
      // Reset UI state when not in form input stage
      setProgress(0);
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
    
    // Then clear global state and storage
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
    
    // Show CHATA ID dialog only when transitioning to form input stage
    if (info.chataId) {
      setIsChataIdDialogOpen(true);
    }
  }, [setClinicianInfo]);

  // Determine current stage and what to show
  const isFormInputStage = globalState?.status === 'draft' && globalState?.chataId && globalState?.clinician?.name;
  const isClinicianModalStage = showModal;
  const isLoadUpStage = !isFormInputStage && !isClinicianModalStage;

  return (
    <div className="app">
      <Header 
        chataId={isFormInputStage ? globalState.chataId : ''}
        progress={progress}
        isChataIdDialogOpen={isChataIdDialogOpen}
      />
      {isFormInputStage ? (
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
        <LandingPage onCreateReport={handleCreateReport} />
      )}
      <ClinicianModal 
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
      />
      <Footer />
    </div>
  );
}; 