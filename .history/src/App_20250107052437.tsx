import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './contexts/FormStateContext';
import type { ClinicianInfo } from './types';
import './App.css';

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [showChataIdDialog, setShowChataIdDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const { globalState, setChataId } = useFormState();

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

  const handleClearForm = () => {
    setShowForm(false);
  };

  return (
    <div className="app">
      <Header 
        chataId={globalState.chataId || ''}
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
            <AssessmentForm
              onClear={handleClearForm}
              onProgressUpdate={setProgress}
              clinicianInfo={{
                name: '',
                email: '',
                clinicName: '',
                childName: '',
                childAge: '',
                childGender: '',
                chataId: globalState.chataId || ''
              }}
              chataId={globalState.chataId || ''}
            />
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