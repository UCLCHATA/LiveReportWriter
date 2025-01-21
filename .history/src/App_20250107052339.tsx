import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useProgressPersistence } from './hooks/useProgressPersistence';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';
import './styles/main.css';
import confetti from 'canvas-confetti';

type ClinicianInfo = {
  name: string;
  email: string;
  clinicName: string;
  childName?: string;
  childAge?: string;
  childGender?: string;
  chataId?: string;
};

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [showChataIdDialog, setShowChataIdDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setChataId } = useFormState();

  const handleClinicianSubmit = async (info: ClinicianInfo) => {
    if (info.chataId) {
      await setChataId(info.chataId);
      setShowForm(true);
      setShowClinicianModal(false);
    }
  };

  const handleClinicianCancel = () => {
    setShowClinicianModal(false);
  };

  const handleCreateClick = () => {
    setShowClinicianModal(true);
  };

  return (
    <div className="app">
      <Header 
        progress={progress}
        isChataIdDialogOpen={showChataIdDialog}
      />
      <main>
        {!showForm && (
          <div className="overlay">
            <button onClick={handleCreateClick} className="create-button">
              Create Report
            </button>
          </div>
        )}
        {showForm && (
          <>
            <AssessmentCarousel
              onProgressUpdate={setProgress}
            />
            <AssessmentForm />
          </>
        )}
      </main>
      <ClinicianModal
        isOpen={showClinicianModal}
        onSubmit={handleClinicianSubmit}
        onCancel={handleClinicianCancel}
        onChataIdDialogChange={setShowChataIdDialog}
      />
    </div>
  );
}; 