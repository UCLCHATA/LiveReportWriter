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
};

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [chataId, setChataId] = useState<string>('');
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);

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

  const celebrateMilestone = useCallback((progress: number) => {
    const milestone = Math.floor(progress / 25) * 25;
    if (milestone > lastCelebrated && milestone >= 25) {
      setLastCelebrated(milestone);
      
      switch (milestone) {
        case 25:
          // Simple confetti burst
          confetti({
            particleCount: 50,
            spread: 90,
            origin: { y: 0 }
          });
          break;
        
        case 50:
          // Double burst
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.2, y: 0 },
            colors: ['#4f46e5', '#818cf8']
          });
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.8, y: 0 },
            colors: ['#4f46e5', '#818cf8']
          });
          break;
        
        case 75:
          // Firework effect
          const end = Date.now() + 1000;
          const colors = ['#4f46e5', '#818cf8'];
          
          (function frame() {
            confetti({
              particleCount: 4,
              startVelocity: 30,
              spread: 360,
              origin: { x: Math.random(), y: Math.random() - 0.2 },
              colors: colors
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 100:
          // Grand finale
          const duration = 2000;
          const animationEnd = Date.now() + duration;
          
          (function frame() {
            const timeLeft = animationEnd - Date.now();
            const particleCount = 3 * (timeLeft / duration);
            
            // Confetti from both sides
            confetti({
              particleCount,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.5 },
              colors: ['#10b981', '#34d399']
            });
            
            confetti({
              particleCount,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.5 },
              colors: ['#10b981', '#34d399']
            });
            
            if (timeLeft > 0) {
              requestAnimationFrame(frame);
            }
          }());
          break;
      }
    }
  }, [lastCelebrated]);

  // Calculate total progress
  const totalProgress = Math.round(formProgress + carouselProgress);

  useEffect(() => {
    celebrateMilestone(totalProgress);
  }, [formProgress, carouselProgress, celebrateMilestone]);

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