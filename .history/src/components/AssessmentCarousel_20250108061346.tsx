import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { useFormState } from '../hooks/useFormState';
import type { GlobalFormState } from '../types/index';
import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';
import confetti from 'canvas-confetti';
import { CarouselHeader } from './CarouselHeader';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface ComponentProps {
  data: any;
  onChange: (data: any) => void;
}

interface CompletionState {
  isComplete: boolean;
  isSkipped: boolean;
  progress: number;
  autoDetected: boolean;
}

interface Tool {
  id: keyof GlobalFormState['assessments'];
  title: string;
  component: React.ComponentType<ComponentProps>;
  description: string;
}

const tools: Tool[] = [
  {
    id: 'sensoryProfile',
    title: 'Sensory Profile',
    component: SensoryProfileBuilder,
    description: 'Evaluate sensory processing patterns'
  },
  {
    id: 'socialCommunication',
    title: 'Social Communication',
    component: SocialCommunicationProfile,
    description: 'Assess social interaction and communication skills'
  },
  {
    id: 'behaviorInterests',
    title: 'Behavior & Interests',
    component: BehaviorInterestsProfile,
    description: 'Document behavioral patterns and interests'
  },
  {
    id: 'milestones',
    title: 'Milestone Tracker',
    component: MilestoneTracker,
    description: 'Track developmental milestones'
  },
  {
    id: 'assessmentLog',
    title: 'Assessment Log',
    component: AssessmentLogger,
    description: 'Record and monitor assessment progress'
  }
];

const getTooltipContent = (title: string): string => {
  switch (title) {
    case 'Sensory Profile':
      return '• Visual, auditory, tactile processing\n• Vestibular and proprioceptive responses\n• Oral sensitivities\n• Sensory seeking/avoiding behaviors';
    case 'Social Communication':
      return '• Joint attention and engagement\n• Verbal/non-verbal communication\n• Social understanding and reciprocity\n• Play skills and peer interactions';
    case 'Behavior & Interests':
      return '• Repetitive behaviors and routines\n• Special interests and fixations\n• Flexibility and transitions\n• Self-regulation abilities';
    case 'Milestone Tracker':
      return '• Motor development\n• Language milestones\n• Social-emotional growth\n• Cognitive development';
    case 'Assessment Log':
      return '• Session observations\n• Progress tracking\n• Assessment notes\n• Development monitoring';
    default:
      return '';
  }
};

const getComponentIcon = (componentId: string) => {
  switch (componentId) {
    case 'sensoryProfile':
      return '/assets/sensory.png';
    case 'socialCommunication':
      return '/assets/Social.png';
    case 'behaviorInterests':
      return '/assets/behavior icon.png';
    case 'milestones':
      return '/assets/development icon.png';
    case 'assessmentLog':
      return '/assets/assessment icon.png';
    default:
      return null;
  }
};

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({
  onProgressUpdate,
  initialProgress
}) => {
  const { globalState, updateAssessment } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(initialProgress);

  // Track completion status for each assessment
  const [completionStatus, setCompletionStatus] = useState({
    sensoryProfile: globalState.assessments.sensoryProfile.isComplete,
    socialCommunication: globalState.assessments.socialCommunication.isComplete,
    behaviorInterests: globalState.assessments.behaviorInterests.isComplete
  });

  // Update completion status when assessment is marked complete
  const handleComplete = (type: keyof typeof completionStatus) => {
    const newStatus = !completionStatus[type];
    setCompletionStatus(prev => ({
      ...prev,
      [type]: newStatus
    }));
    
    // Update assessment in global state
    updateAssessment(type, { isComplete: newStatus });
    
    // Log completion status change
    console.log('🎯 Assessment completion:', {
      type,
      isComplete: newStatus,
      progress: globalState.assessments[type].progress
    });
  };

  // Calculate progress based on all assessments
  useEffect(() => {
    const totalProgress = Math.round(
      (completionStatus.sensoryProfile ? 100 : globalState.assessments.sensoryProfile.progress) +
      (completionStatus.socialCommunication ? 100 : globalState.assessments.socialCommunication.progress) +
      (completionStatus.behaviorInterests ? 100 : globalState.assessments.behaviorInterests.progress)
    ) / 3;

    if (totalProgress !== progress) {
      setProgress(totalProgress);
      onProgressUpdate(totalProgress);
    }
  }, [completionStatus, globalState.assessments, onProgressUpdate, progress]);

  return (
    <div className={styles.carousel}>
      <div className={styles.navigation}>
        {/* Navigation icons with completion status */}
        <button 
          className={`${styles.navButton} ${currentIndex === 0 ? styles.active : ''} ${completionStatus.sensoryProfile ? styles.complete : ''}`}
          onClick={() => setCurrentIndex(0)}
        >
          Sensory Profile
          {completionStatus.sensoryProfile && <span className={styles.checkmark}>✓</span>}
        </button>
        <button 
          className={`${styles.navButton} ${currentIndex === 1 ? styles.active : ''} ${completionStatus.socialCommunication ? styles.complete : ''}`}
          onClick={() => setCurrentIndex(1)}
        >
          Social Communication
          {completionStatus.socialCommunication && <span className={styles.checkmark}>✓</span>}
        </button>
        <button 
          className={`${styles.navButton} ${currentIndex === 2 ? styles.active : ''} ${completionStatus.behaviorInterests ? styles.complete : ''}`}
          onClick={() => setCurrentIndex(2)}
        >
          Behavior & Interests
          {completionStatus.behaviorInterests && <span className={styles.checkmark}>✓</span>}
        </button>
      </div>

      <div className={styles.content}>
        {/* Assessment content with completion overlay */}
        <div className={styles.assessmentContainer}>
          {currentIndex === 0 && (
            <div className={`${styles.assessment} ${completionStatus.sensoryProfile ? styles.completed : ''}`}>
              <SensoryProfileAssessment 
                assessment={globalState.assessments.sensoryProfile}
                onUpdate={(updates) => updateAssessment('sensoryProfile', updates)}
                onComplete={() => handleComplete('sensoryProfile')}
                isComplete={completionStatus.sensoryProfile}
              />
              {completionStatus.sensoryProfile && <div className={styles.completionOverlay} />}
            </div>
          )}
          {currentIndex === 1 && (
            <div className={`${styles.assessment} ${completionStatus.socialCommunication ? styles.completed : ''}`}>
              <SocialCommunicationAssessment 
                assessment={globalState.assessments.socialCommunication}
                onUpdate={(updates) => updateAssessment('socialCommunication', updates)}
                onComplete={() => handleComplete('socialCommunication')}
                isComplete={completionStatus.socialCommunication}
              />
              {completionStatus.socialCommunication && <div className={styles.completionOverlay} />}
            </div>
          )}
          {currentIndex === 2 && (
            <div className={`${styles.assessment} ${completionStatus.behaviorInterests ? styles.completed : ''}`}>
              <BehaviorInterestsAssessment 
                assessment={globalState.assessments.behaviorInterests}
                onUpdate={(updates) => updateAssessment('behaviorInterests', updates)}
                onComplete={() => handleComplete('behaviorInterests')}
                isComplete={completionStatus.behaviorInterests}
              />
              {completionStatus.behaviorInterests && <div className={styles.completionOverlay} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCarousel; 