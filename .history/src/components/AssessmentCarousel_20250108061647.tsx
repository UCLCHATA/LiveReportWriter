import React, { useState, useEffect } from 'react';
import { useFormState } from '../hooks/useFormState';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile } from './BehaviorInterestsProfile';
import { SensoryProfileAssessment, SocialCommunicationAssessment, BehaviorInterestsAssessment } from '../types';
import styles from './AssessmentCarousel.module.css';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

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

  // Transform assessment data to match component props
  const transformSensoryData = (assessment: SensoryProfileAssessment) => {
    const domains: Record<string, any> = {};
    Object.entries(assessment.domains).forEach(([key, value]) => {
      domains[key] = {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value.value,
        observations: value.observations,
        label: 'Typical' // Default label
      };
    });
    return { domains };
  };

  const transformSocialData = (assessment: SocialCommunicationAssessment) => {
    const domains: Record<string, any> = {};
    Object.entries(assessment.domains).forEach(([key, value]) => {
      domains[key] = {
        name: key.split(/(?=[A-Z])/).join(' '),
        value: value.value,
        observations: value.observations,
        label: 'Emerging' // Default label
      };
    });
    return { domains };
  };

  const transformBehaviorData = (assessment: BehaviorInterestsAssessment) => {
    const domains: Record<string, any> = {};
    Object.entries(assessment.domains).forEach(([key, value]) => {
      domains[key] = {
        name: key.split(/(?=[A-Z])/).join(' '),
        value: value.value,
        observations: value.observations,
        label: 'Moderate Impact' // Default label
      };
    });
    return { domains };
  };

  // Transform component data back to assessment format
  const transformToAssessmentData = (data: any, type: 'sensoryProfile' | 'socialCommunication' | 'behaviorInterests') => {
    const domains: Record<string, { value: number; observations: string[] }> = {};
    Object.entries(data.domains).forEach(([key, value]: [string, any]) => {
      domains[key] = {
        value: value.value,
        observations: value.observations
      };
    });
    return { type, domains };
  };

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
              <SensoryProfileBuilder 
                data={transformSensoryData(globalState.assessments.sensoryProfile)}
                onChange={(data) => updateAssessment('sensoryProfile', transformToAssessmentData(data, 'sensoryProfile'))}
              />
              {completionStatus.sensoryProfile && <div className={styles.completionOverlay} />}
            </div>
          )}
          {currentIndex === 1 && (
            <div className={`${styles.assessment} ${completionStatus.socialCommunication ? styles.completed : ''}`}>
              <SocialCommunicationProfile 
                data={transformSocialData(globalState.assessments.socialCommunication)}
                onChange={(data) => updateAssessment('socialCommunication', transformToAssessmentData(data, 'socialCommunication'))}
              />
              {completionStatus.socialCommunication && <div className={styles.completionOverlay} />}
            </div>
          )}
          {currentIndex === 2 && (
            <div className={`${styles.assessment} ${completionStatus.behaviorInterests ? styles.completed : ''}`}>
              <BehaviorInterestsProfile 
                data={transformBehaviorData(globalState.assessments.behaviorInterests)}
                onChange={(data) => updateAssessment('behaviorInterests', transformToAssessmentData(data, 'behaviorInterests'))}
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