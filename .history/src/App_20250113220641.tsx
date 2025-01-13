import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './contexts/FormStateContext';
import { getStorageKey } from './hooks/useFormState';
import { ClinicianInfo, AssessmentData } from './types/index';
import './styles/main.css';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const { 
    globalState, 
    setClinicianInfo,
    clearState,
    updateFormData,
    updateAssessment
  } = useFormState();

  const [showChataIdDialog, setShowChataIdDialog] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  
  // Initialize state from localStorage
  const [showForm, setShowForm] = useState(() => {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    const hasProgress = 
      parsed?.formData?.formProgress > 0 ||
      (parsed?.assessments?.sensoryProfile?.progress ?? 0) > 0;
    return hasProgress;
  });

  const [showModal, setShowModal] = useState(!showForm);

  const handleCreateReport = () => {
    setShowModal(true);
  };

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setShowForm(true);
    setShowModal(false);
  };

  const handleClearForm = () => {
    clearState();
    setShowForm(false);
    setShowModal(true);
  };

  return (
    <div className="app">
      <Header 
        chataId={showChataIdDialog ? globalState.chataId : ''} 
        progress={formProgress} 
        isChataIdDialogOpen={showChataIdDialog}
      />
      {showForm ? (
        <>
          <AssessmentCarousel 
            initialProgress={carouselProgress}
            onProgressUpdate={setCarouselProgress}
          />
          <AssessmentForm 
            onClear={handleClearForm}
            onProgressUpdate={setFormProgress}
            initialProgress={formProgress}
          />
        </>
      ) : (
        <Overlay onCreateReport={handleCreateReport} />
      )}
      <ClinicianModal 
        isOpen={showModal} 
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
        onChataIdDialogChange={setShowChataIdDialog}
      />
    </div>
  );
}; 