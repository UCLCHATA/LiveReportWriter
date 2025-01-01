import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useProgressPersistence } from './hooks/useProgressPersistence';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';
import './styles/main.css';

type ClinicianInfo = {
  name: string;
  email: string;
};

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [chataId, setChataId] = useState<string>('');
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);

  // Initialize progress persistence
  const { storedProgress, saveProgress, clearProgress } = useProgressPersistence(chataId);

  // Load stored progress when component mounts or chataId changes
  useEffect(() => {
    if (storedProgress) {
      setFormProgress(storedProgress.formProgress);
      setCarouselProgress(storedProgress.carouselProgress);
    }
  }, [storedProgress]);

  const handleCreateReport = () => {
    setShowModal(true);
  };

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setShowModal(false);
    setShowForm(true);
    // Generate CHATA ID using clinician's name and timestamp
    const timestamp = new Date().getTime();
    const id = `CHATA-${info.name.substring(0, 3).toUpperCase()}-${timestamp.toString().slice(-6)}`;
    setChataId(id);
  };

  const handleClearForm = () => {
    setShowForm(false);
    setClinicianInfo(null);
    setChataId('');
    setFormProgress(0);
    setCarouselProgress(0);
    clearProgress();
  };

  const handleFormProgressUpdate = (progress: number) => {
    setFormProgress(progress);
    saveProgress(progress, carouselProgress);
  };

  const handleCarouselProgressUpdate = (progress: number) => {
    setCarouselProgress(progress);
    saveProgress(formProgress, progress);
  };

  // Calculate total progress
  const totalProgress = Math.round(formProgress + carouselProgress);

  return (
    <div className="app">
      <Header chataId={chataId} progress={totalProgress} />

      <main>
        {!showForm ? (
          <Overlay onCreateReport={handleCreateReport} />
        ) : (
          <>
            <div className="left-panel active">
              <AssessmentCarousel onProgressUpdate={handleCarouselProgressUpdate} />
            </div>
            <div className="right-panel active">
              <div className="form-container active">
                <AssessmentForm onClear={handleClearForm} onProgressUpdate={handleFormProgressUpdate} />
              </div>
            </div>
          </>
        )}
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logos">
            <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
            <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
          </div>
          <div>© 2024 UCL & NHS. For support contact: uclchata@gmail.com</div>
        </div>
      </footer>

      <ClinicianModal
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}; 