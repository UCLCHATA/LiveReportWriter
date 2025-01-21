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
  chataId?: string;
};

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [chataId, setChataId] = useState<string>('');
  const [formProgress, setFormProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);
  const [showChataIdInfo, setShowChataIdInfo] = useState(false);

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
      // Also set it in the form state
      const { useFormState } = require('./hooks/useFormState');
      const { setGlobalState } = useFormState();
      setGlobalState((prev: any) => ({
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
    if (milestone >= 25 && milestone !== lastCelebrated) {
      setLastCelebrated(milestone);
      
      switch (milestone) {
        case 25:
          // Simple burst with varied colors
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.3 },
            colors: ['#818cf8', '#93c5fd', '#6366f1'],
            gravity: 1.2
          });
          break;
        
        case 50:
          // Dual bursts with scalar animation
          const end50 = Date.now() + 750;
          const colors50 = ['#4f46e5', '#818cf8', '#6366f1'];
          
          (function frame() {
            confetti({
              particleCount: 6,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.3 },
              colors: colors50,
              scalar: 1.2
            });
            
            confetti({
              particleCount: 6,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.3 },
              colors: colors50,
              scalar: 1.2
            });
            
            if (Date.now() < end50) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 75:
          // Firework effect with multiple bursts
          const end75 = Date.now() + 1500;
          const colors75 = ['#4f46e5', '#818cf8', '#6366f1'];
          
          (function frame() {
            confetti({
              particleCount: 10,
              angle: 45 + Math.random() * 90,
              spread: 60 + Math.random() * 60,
              origin: { 
                x: 0.2 + Math.random() * 0.6, 
                y: 0.2 + Math.random() * 0.2 
              },
              colors: colors75,
              ticks: 200,
              gravity: 1.2,
              scalar: 1.2,
              drift: 0.5
            });
            
            if (Date.now() < end75) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 100:
          // Grand finale with multiple effects
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const colors100 = ['#10b981', '#34d399', '#059669', '#047857'];
          
          // First wave: Side streamers
          (function frame() {
            const timeLeft = animationEnd - Date.now();
            const particleCount = 4;
            
            // Left and right streamers
            confetti({
              particleCount,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.4 },
              colors: colors100,
              ticks: 300,
              gravity: 1,
              scalar: 1.2,
              drift: 0.2
            });
            
            confetti({
              particleCount,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.4 },
              colors: colors100,
              ticks: 300,
              gravity: 1,
              scalar: 1.2,
              drift: -0.2
            });
            
            // Center bursts
            confetti({
              particleCount: 2,
              angle: 90,
              spread: 120,
              origin: { x: 0.5, y: 0.3 },
              colors: colors100,
              ticks: 300,
              gravity: 0.8,
              scalar: 1.5,
              drift: 0
            });
            
            if (timeLeft > 0) {
              requestAnimationFrame(frame);
            }
          }());
          
          // Second wave: Delayed center burst
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.35 },
              colors: colors100,
              ticks: 200,
              gravity: 1,
              scalar: 1.2,
              drift: 0
            });
          }, 1000);
          
          // Final wave: Random bursts
          setTimeout(() => {
            const finalEnd = Date.now() + 1000;
            (function frame() {
              confetti({
                particleCount: 20,
                angle: 30 + Math.random() * 120,
                spread: 55,
                origin: { 
                  x: 0.2 + Math.random() * 0.6, 
                  y: 0.2 + Math.random() * 0.2 
                },
                colors: colors100,
                ticks: 200,
                gravity: 0.8,
                scalar: 1.2,
                drift: Math.random() - 0.5
              });
              
              if (Date.now() < finalEnd) {
                requestAnimationFrame(frame);
              }
            }());
          }, 2000);
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