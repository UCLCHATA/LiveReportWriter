import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useProgressPersistence } from './hooks/useProgressPersistence';
import { useFormState } from './hooks/useFormState';
import type { ClinicianInfo } from './types';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';
import './styles/App.css';

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [chataId, setChataId] = useState<string>('');
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);

  // Initialize form state
  const { setGlobalState, clearState } = useFormState();

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
    // Use the CHATA ID from the clinician info
    if (info.chataId) {
      setChataId(info.chataId);
      // Update the global form state
      setGlobalState((prev) => ({
        ...prev,
        chataId: info.chataId,
        clinician: {
          name: info.name,
          email: info.email
        }
      }));
    }
  };

  const handleClearForm = () => {
    setShowForm(false);
    setClinicianInfo(null);
    setChataId('');
    setFormProgress(0);
    setCarouselProgress(0);
    clearProgress();
    clearState();
  };

  const handleFormProgressUpdate = (progress: number) => {
    setFormProgress(progress);
    saveProgress(progress, carouselProgress);
  };

  const handleCarouselProgressUpdate = (progress: number) => {
    setCarouselProgress(progress);
    saveProgress(formProgress, progress);
  };

  const celebrateMilestone = useCallback((totalProgress: number) => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => totalProgress >= m && m > lastCelebrated);
    
    if (currentMilestone) {
      setLastCelebrated(currentMilestone);
      
      // Show celebration animation
      const confetti = document.createElement('div');
      confetti.className = 'confetti-container';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }
  }, [lastCelebrated]);

  // Calculate total progress
  const totalProgress = Math.round(formProgress + carouselProgress);

  useEffect(() => {
    celebrateMilestone(totalProgress);
  }, [formProgress, carouselProgress, celebrateMilestone]);

  return (
    <div className="app">
      <Header 
        chataId={chataId} 
        progress={totalProgress} 
        isChataIdDialogOpen={showChataIdInfo} 
      />

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
        onChataIdDialogChange={setShowChataIdInfo}
      />
    </div>
  );
}; 