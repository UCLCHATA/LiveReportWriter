import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { Overlay } from './components/Overlay';
import { ClinicianModal } from './components/ClinicianModal';
import { useProgressPersistence } from './hooks/useProgressPersistence';
import confetti from 'canvas-confetti';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';
import './styles/main.css';

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chataId, setChataId] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [lastCelebrated, setLastCelebrated] = useState(0);
  const { storedProgress, saveProgress, clearProgress } = useProgressPersistence(chataId);

  const handleCreateReport = () => {
    setShowModal(true);
  };

  const handleClinicianSubmit = (clinicianId: string) => {
    setChataId(clinicianId);
    setShowForm(true);
    setShowModal(false);
  };

  const handleClearForm = () => {
    clearProgress();
    setFormProgress(0);
    setCarouselProgress(0);
    setLastCelebrated(0);
  };

  const celebrateMilestone = useCallback((currentProgress: number) => {
    const milestones = [25, 50, 75, 100];
    const crossedMilestone = milestones.find(m => 
      currentProgress >= m && // Current progress is at or above milestone
      lastCelebrated < m     // Haven't celebrated this milestone yet
    );

    if (crossedMilestone) {
      setLastCelebrated(crossedMilestone);
      
      switch (crossedMilestone) {
        case 25:
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          break;
        
        case 50:
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#818cf8', '#6366f1']
          });
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#4f46e5', '#818cf8', '#6366f1']
            });
          }, 250);
          break;
        
        case 75:
          const end = Date.now() + 1000;
          const colors = ['#4f46e5', '#818cf8'];
          
          (function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.6 },
              colors: colors
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.6 },
              colors: colors
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 100:
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          
          (function frame() {
            const timeLeft = animationEnd - Date.now();
            
            const particleCount = 50 * (timeLeft / duration);
            confetti({
              particleCount,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#059669', '#047857'],
              startVelocity: 30,
              gravity: 0.8,
              scalar: 1.2,
              drift: 0
            });
            
            if (timeLeft > 0) {
              requestAnimationFrame(frame);
            }
          }());
          break;
      }
    }
  }, [lastCelebrated]);

  const handleFormProgressUpdate = (progress: number) => {
    setFormProgress(progress);
    saveProgress(progress, carouselProgress);
  };

  const handleCarouselProgressUpdate = (progress: number) => {
    setCarouselProgress(progress);
    saveProgress(formProgress, progress);
  };

  // Calculate total progress and trigger celebration if needed
  const totalProgress = Math.round(formProgress + carouselProgress);
  React.useEffect(() => {
    celebrateMilestone(totalProgress);
  }, [totalProgress, celebrateMilestone]);

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