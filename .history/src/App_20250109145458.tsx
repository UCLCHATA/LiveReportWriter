import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './contexts/FormStateContext';
import { getStorageKey } from './hooks/useFormState';
import { ClinicianInfo, AssessmentData } from './types';
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

  // Initialize state from localStorage
  const [showForm, setShowForm] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (!saved) return false;
    
    try {
      const parsed = JSON.parse(saved);
      const hasContent = 
        parsed?.formData?.clinicalObservations ||
        parsed?.formData?.strengths ||
        parsed?.formData?.priorityAreas ||
        parsed?.formData?.recommendations;
      const hasProgress = 
        parsed?.formData?.formProgress > 0 ||
        parsed?.assessments?.sensoryProfile?.progress > 0;
      
      console.log('🔄 Initial state check:', {
        hasContent,
        hasProgress,
        formProgress: parsed?.formData?.formProgress || 0
      });
      
      return hasContent || hasProgress;
    } catch (error) {
      console.error('❌ Failed to parse initial state:', error);
      return false;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [formProgress, setFormProgress] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (!saved) return 0;
    
    try {
      const parsed = JSON.parse(saved);
      return parsed?.formData?.formProgress || 0;
    } catch {
      return 0;
    }
  });
  
  const [carouselProgress, setCarouselProgress] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (!saved) return 0;
    
    try {
      const parsed = JSON.parse(saved);
      return parsed?.assessments?.sensoryProfile?.progress || 0;
    } catch {
      return 0;
    }
  });

  const [lastCelebrated, setLastCelebrated] = useState<number>(0);

  // Load form state when component mounts - now only for logging
  useEffect(() => {
    if (!showForm) {
      const hasContent = 
        globalState.formData?.clinicalObservations ||
        globalState.formData?.strengths ||
        globalState.formData?.priorityAreas ||
        globalState.formData?.recommendations;
      
      const hasProgress =
        globalState.formData?.formProgress > 0 ||
        globalState.assessments?.sensoryProfile.progress > 0;
      
      if (hasContent || hasProgress) {
        console.log('📋 Found saved content:', {
          content: {
            clinicalObservations: globalState.formData?.clinicalObservations?.length || 0,
            strengths: globalState.formData?.strengths?.length || 0,
            priorityAreas: globalState.formData?.priorityAreas?.length || 0,
            recommendations: globalState.formData?.recommendations?.length || 0
          },
          progress: {
            form: globalState.formData?.formProgress || 0,
            assessment: globalState.assessments?.sensoryProfile.progress || 0
          }
        });
        setShowForm(true);
      }
    }
  }, [globalState, showForm]);

  const handleCreateReport = () => {
    console.log('📝 Creating new report');
    setShowModal(true);
  };

  const handleClinicianSubmit = (info: Partial<ClinicianInfo>) => {
    console.log('👤 Setting clinician info:', info);
    setClinicianInfo({
      name: info.name || '',
      email: info.email || '',
      clinicName: info.clinicName || '',
      childName: info.childName || '',
      childAge: info.childAge || '',
      childGender: info.childGender || '',
      chataId: info.chataId
    });
    setShowModal(false);
    setShowForm(true);
  };

  const handleClearForm = () => {
    console.log('🗑️ Clearing form and storage');
    localStorage.removeItem(getStorageKey());
    setShowForm(false);
    clearState();
    setFormProgress(0);
    setCarouselProgress(0);
  };

  const handleFormProgressUpdate = (progress: number) => {
    // Only update if the new progress is higher than current
    // This prevents resetting progress on component mount
    if (progress <= formProgress) return;
    
    console.log('📊 Form progress update:', {
      current: formProgress,
      new: progress,
      source: 'handleFormProgressUpdate'
    });
    
    setFormProgress(progress);
    updateFormData({ formProgress: progress });
  };

  const handleCarouselProgressUpdate = (progress: number) => {
    // Only update if the new progress is higher than current
    // This prevents resetting progress on component mount
    if (progress <= carouselProgress) return;
    
    console.log('📊 Carousel progress update:', {
      current: carouselProgress,
      new: progress,
      source: 'handleCarouselProgressUpdate'
    });
    
    setCarouselProgress(progress);
    // Update progress for all assessment types
    const assessmentTypes: (keyof AssessmentData)[] = [
      'sensoryProfile',
      'socialCommunication',
      'behaviorInterests',
      'milestones',
      'assessmentLog'
    ];
    assessmentTypes.forEach(type => {
      updateAssessment(type, { progress });
    });
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
        chataId={globalState.chataId}
        progress={formProgress}
        onClear={handleClearForm}
        showClearButton={showForm}
      />
      {!showForm ? (
        <Overlay onCreateReport={handleCreateReport} />
      ) : (
        <>
          <AssessmentCarousel
            onProgressUpdate={handleCarouselProgressUpdate}
            initialProgress={carouselProgress}
          />
          <AssessmentForm
            onProgressUpdate={handleFormProgressUpdate}
            initialProgress={formProgress}
            onClear={handleClearForm}
          />
        </>
      )}
      <ClinicianModal
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
        onChataIdDialogChange={(isOpen) => {
          console.log('🔑 CHATA ID dialog state change:', isOpen);
        }}
      />
    </div>
  );
}; 