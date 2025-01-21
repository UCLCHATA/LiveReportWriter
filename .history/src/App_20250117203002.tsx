import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { useFormState } from './hooks/useFormState';
import type { ClinicianInfo, AssessmentData } from './types';
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

  // Initialize state from form state
  const [showForm, setShowForm] = useState(() => {
    if (!globalState) return false;
    
    const hasContent = 
      globalState.formData?.clinicalObservations ||
      globalState.formData?.strengths ||
      globalState.formData?.priorityAreas ||
      globalState.formData?.recommendations;
    
    const hasProgress = 
      globalState.formData?.formProgress > 0 ||
      (globalState.assessments?.sensoryProfile?.progress ?? 0) > 0;
    
    console.log('🔄 Initial state check:', {
      hasContent,
      hasProgress,
      formProgress: globalState.formData?.formProgress || 0
    });
    
    return hasContent || hasProgress;
  });

  const [showModal, setShowModal] = useState(false);
  const [isChataIdDialogOpen, setIsChataIdDialogOpen] = useState(false);
  const [formProgress, setFormProgress] = useState(() => {
    return globalState?.formData?.formProgress || 0;
  });
  
  const [carouselProgress, setCarouselProgress] = useState(() => {
    return globalState?.assessments?.sensoryProfile?.progress || 0;
  });

  const [lastCelebrated, setLastCelebrated] = useState<number>(0);

  // Load form state when component mounts - now only for logging
  useEffect(() => {
    if (!showForm && globalState) {
      const hasContent = 
        globalState.formData?.clinicalObservations ||
        globalState.formData?.strengths ||
        globalState.formData?.priorityAreas ||
        globalState.formData?.recommendations;
      
      const hasProgress =
        globalState.formData?.formProgress > 0 ||
        (globalState.assessments?.sensoryProfile?.progress ?? 0) > 0;
      
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
            assessment: globalState.assessments?.sensoryProfile?.progress ?? 0
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
    if (!info.name || !info.email || !info.clinicName) {
        console.error('Missing required clinician information');
        return;
    }
    
    setClinicianInfo({
        name: info.name,
        email: info.email,
        clinicName: info.clinicName,
        childFirstName: info.childFirstName || '',
        childLastName: info.childLastName || '',
        childAge: info.childAge || '',
        childGender: info.childGender || '',
        chataId: info.chataId
    });
    
    // Only close the modal and show the form if we're not showing the CHATA ID dialog
    if (!info.chataId) {
        setShowModal(false);
        setShowForm(true);
    } else {
        setShowForm(true);
    }
  };

  const handleClearForm = () => {
    console.log('🗑️ Clearing form and storage');
    setShowForm(false);
    clearState();
    setFormProgress(0);
    setCarouselProgress(0);
  };

  const handleFormProgressUpdate = useCallback((progress: number) => {
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
  }, [formProgress, updateFormData]);

  const handleCarouselProgressUpdate = useCallback((progress: number) => {
    // Prevent unnecessary updates
    if (progress === carouselProgress) return;
    
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
  }, [carouselProgress, updateAssessment]);

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
              gravity: 1.2
            });
            
            if (Date.now() < end75) {
              requestAnimationFrame(frame);
            }
          }());
          break;
        
        case 100:
          // Grand finale with multiple effects
          const end100 = Date.now() + 2000;
          const colors100 = ['#4f46e5', '#818cf8', '#6366f1', '#93c5fd'];
          
          (function frame() {
            // Center burst
            confetti({
              particleCount: 15,
              spread: 100,
              origin: { x: 0.5, y: 0.3 },
              colors: colors100,
              gravity: 1
            });
            
            // Side bursts
            confetti({
              particleCount: 8,
              angle: 60,
              spread: 50,
              origin: { x: 0, y: 0.3 },
              colors: colors100,
              gravity: 1
            });
            
            confetti({
              particleCount: 8,
              angle: 120,
              spread: 50,
              origin: { x: 1, y: 0.3 },
              colors: colors100,
              gravity: 1
            });
            
            if (Date.now() < end100) {
              requestAnimationFrame(frame);
            }
          }());
          break;
      }
    }
  }, [lastCelebrated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onCreateReport={handleCreateReport}
        onClearForm={handleClearForm}
        showClearButton={showForm}
      />
      
      {showForm ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AssessmentCarousel 
              onProgressUpdate={handleCarouselProgressUpdate}
              progress={carouselProgress}
              onMilestoneReached={celebrateMilestone}
            />
            <AssessmentForm 
              onProgressUpdate={handleFormProgressUpdate}
              progress={formProgress}
              onMilestoneReached={celebrateMilestone}
            />
          </div>
        </div>
      ) : (
        <Overlay onCreateReport={handleCreateReport} />
      )}
      
      {showModal && (
        <ClinicianModal
          onClose={() => setShowModal(false)}
          onSubmit={handleClinicianSubmit}
          isChataIdDialogOpen={isChataIdDialogOpen}
          onChataIdDialogClose={() => setIsChataIdDialogOpen(false)}
        />
      )}
    </div>
  );
}; 