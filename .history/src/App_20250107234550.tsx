import React, { useState, useEffect } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { ClinicianModal } from './components/ClinicianModal';
import { Header } from './components/Header';
import { useFormState } from './hooks/useFormState';
import { formPersistence } from './services/formPersistence';
import { ClinicianInfo } from './types';

export const App: React.FC = () => {
  const {
    globalState,
    setClinicianInfo,
    clearState,
    updateProgress,
    setChataId,
    restoreDraft,
    validatedChataId
  } = useFormState();

  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);

  // Check for existing draft when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chataIdFromUrl = urlParams.get('chataId');
    if (chataIdFromUrl) {
      const form = formPersistence.getForm(chataIdFromUrl);
      if (form) {
        setClinicianInfo({
          name: form.clinicianInfo.name,
          email: form.clinicianInfo.email
        });
        setChataId(chataIdFromUrl);
        setShowForm(true);
      }
    }
  }, [setClinicianInfo, setChataId]);

  // Show form when we have a chataId
  useEffect(() => {
    if (validatedChataId) {
      setShowForm(true);
    }
  }, [validatedChataId]);

  const handleCreateReport = () => {
    setShowModal(true);
  };

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setShowModal(false);
    if (info.chataId) {
      setChataId(info.chataId);
    }
  };

  const handleClearForm = () => {
    setShowForm(false);
    clearState();
  };

  return (
    <div className="app">
      <Header
        chataId={validatedChataId}
        progress={globalState.progress.form}
        isChataIdDialogOpen={showChataIdInfo}
      />
      {!showForm ? (
        <div className="welcome-screen">
          <h1>Welcome to R3</h1>
          <p>
            R3 is a comprehensive assessment tool designed to help clinicians evaluate and track
            developmental progress.
          </p>
          <button onClick={handleCreateReport} className="create-report-button">
            Create Report
          </button>
        </div>
      ) : (
        <div className="form-container">
          <AssessmentCarousel
            onProgressUpdate={(progress) => updateProgress(undefined, progress)}
          />
          <AssessmentForm
            onClear={handleClearForm}
            onProgressUpdate={(progress) => updateProgress(progress)}
          />
        </div>
      )}
      <ClinicianModal
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
        onChataIdDialogChange={setShowChataIdInfo}
      />
    </div>
  );
}; 