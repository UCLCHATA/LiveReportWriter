import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FormState, 
  ClinicianInfo, 
  AssessmentData,
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  MilestoneTrackerData,
  AssessmentLogData,
  Milestone,
  AssessmentEntry,
  isMilestone,
  isMilestoneTrackerData,
  isAssessmentEntry,
  isAssessmentLogData,
  SensoryDomain,
  SocialCommunicationDomain,
  BehaviorDomain
} from '../types';

// Add back the interface
interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: FormState;
  assessments: AssessmentData;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

// Constants can stay outside
export const getStorageKey = (chataId: string = '') => `chata-form-${chataId || 'draft'}`;
const SAVE_DELAY = 3000; // Increase to 3 seconds
const MIN_SAVE_INTERVAL = 2000; // Increase to 2 seconds
const MIN_OPERATION_INTERVAL = 1000; // Increase to 1 second

// Keep only essential counters
let hookInstanceCount = 0;
let restoreAttemptCount = 0;

// Add back initial state and validation
const initialFormData: FormState = {
  status: 'draft',
  ascStatus: '',
  adhdStatus: '',
  referrals: {
    speech: false,
    educational: false,
    sleep: false,
    occupational: false,
    mental: false,
    other: false
  },
  remarks: '',
  clinicalObservations: '',
  priorityAreas: '',
  strengths: '',
  recommendations: '',
  formProgress: 0,
  lastUpdated: new Date().toISOString()
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
    childName: '',
    childAge: '',
    childGender: ''
  },
  formData: initialFormData,
  assessments: {
    sensoryProfile: {
      type: 'sensoryProfile',
      domains: {
        visual: { 
          name: 'Visual',
          value: 0, 
          observations: [],
          label: 'Typical'
        },
        auditory: { 
          name: 'Auditory',
          value: 0, 
          observations: [],
          label: 'Typical'
        },
        tactile: { 
          name: 'Tactile',
          value: 0, 
          observations: [],
          label: 'Typical'
        },
        vestibular: { 
          name: 'Vestibular',
          value: 0, 
          observations: [],
          label: 'Typical'
        },
        proprioceptive: { 
          name: 'Proprioceptive',
          value: 0, 
          observations: [],
          label: 'Typical'
        },
        oral: { 
          name: 'Oral',
          value: 0, 
          observations: [],
          label: 'Typical'
        }
      },
      progress: 0,
      isComplete: false
    },
    socialCommunication: {
      type: 'socialCommunication',
      domains: {
        jointAttention: { 
          name: 'Joint Attention',
          value: 0, 
          observations: [],
          label: 'Emerging'
        },
        nonverbalCommunication: { 
          name: 'Non-verbal Communication',
          value: 0, 
          observations: [],
          label: 'Emerging'
        },
        verbalCommunication: { 
          name: 'Verbal Communication',
          value: 0, 
          observations: [],
          label: 'Emerging'
        },
        socialUnderstanding: { 
          name: 'Social Understanding',
          value: 0, 
          observations: [],
          label: 'Emerging'
        },
        playSkills: { 
          name: 'Play Skills',
          value: 0, 
          observations: [],
          label: 'Emerging'
        },
        peerInteractions: { 
          name: 'Peer Interactions',
          value: 0, 
          observations: [],
          label: 'Emerging'
        }
      },
      progress: 0,
      isComplete: false
    },
    behaviorInterests: {
      type: 'behaviorInterests',
      domains: {
        repetitiveBehaviors: { 
          name: 'Repetitive Behaviors',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        },
        routinesRituals: { 
          name: 'Routines & Rituals',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        },
        specialInterests: { 
          name: 'Special Interests',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        },
        sensoryInterests: { 
          name: 'Sensory Interests',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        },
        emotionalRegulation: { 
          name: 'Emotional Regulation',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        },
        flexibility: { 
          name: 'Flexibility',
          value: 0, 
          observations: [],
          label: 'Moderate Impact'
        }
      },
      progress: 0,
      isComplete: false
    },
    milestones: {
      type: 'milestoneTracker',
      milestones: [
        // Communication milestones
        { id: 'babbling', title: 'Babbling', category: 'communication', expectedAge: 6 },
        { id: 'name-response', title: 'Name response', category: 'communication', expectedAge: 9 },
        { id: 'points-to-show', title: 'Points to show', category: 'communication', expectedAge: 12 },
        { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
        { id: 'combines-words', title: 'Combines words', category: 'communication', expectedAge: 24 },
        
        // Motor milestones
        { id: 'head-control', title: 'Head control', category: 'motor', expectedAge: 3 },
        { id: 'reaches-grasps', title: 'Reaches & grasps', category: 'motor', expectedAge: 4 },
        { id: 'independent-sitting', title: 'Independent sitting', category: 'motor', expectedAge: 6 },
        { id: 'independent-walking', title: 'Independent walking', category: 'motor', expectedAge: 12 },
        { id: 'climbs-runs', title: 'Climbs & runs', category: 'motor', expectedAge: 18 },
        
        // Social milestones
        { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
        { id: 'eye-contact', title: 'Eye contact', category: 'social', expectedAge: 3 },
        { id: 'imitation', title: 'Imitation', category: 'social', expectedAge: 9 },
        { id: 'pretend-play', title: 'Pretend play', category: 'social', expectedAge: 18 },
        { id: 'interactive-play', title: 'Interactive play', category: 'social', expectedAge: 24 },
        
        // Development concerns
        { id: 'rigid-play', title: 'Rigid play patterns', category: 'concerns', expectedAge: 0 },
        { id: 'limited-social', title: 'Limited social engagement', category: 'concerns', expectedAge: 0 },
        { id: 'sensory-issues', title: 'Sensory seeking/avoiding', category: 'concerns', expectedAge: 0 }
      ],
      customMilestones: [],
      history: '',
      progress: 0,
      formProgress: 0,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    },
    assessmentLog: {
      type: 'assessmentLog',
      selectedAssessments: [],
      entries: {},
      progress: 0,
      isComplete: false
    }
  },
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
  status: 'draft'
};

// Add back validation function
function isValidState(state: any): state is GlobalFormState {
  if (!state || typeof state !== 'object') return false;
  if (!state.formData || !state.assessments) return false;
  
  // Check for required properties
  const requiredProps = ['chataId', 'clinician', 'currentStep', 'lastUpdated', 'status'];
  if (!requiredProps.every(prop => prop in state)) return false;

  // Validate form data
  const formProps = ['status', 'formProgress', 'lastUpdated'];
  if (!formProps.every(prop => prop in state.formData)) return false;

  // Validate assessments
  const assessmentTypes = ['sensoryProfile', 'socialCommunication', 'behaviorInterests', 'milestones', 'assessmentLog'];
  if (!assessmentTypes.every(type => type in state.assessments)) return false;

  return true;
}

export const useFormState = () => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');

  // Load initial state from localStorage first
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (!saved) return initialState;
      
      const parsed = JSON.parse(saved);
      if (!isValidState(parsed)) return initialState;
      
      // Ensure we preserve all progress values
      const restoredState = {
        ...initialState,
        ...parsed,
        formData: {
          ...initialState.formData,
          ...parsed.formData,
          formProgress: Math.max(parsed.formData?.formProgress || 0, initialState.formData.formProgress)
        },
        assessments: {
          ...initialState.assessments,
          ...parsed.assessments,
          sensoryProfile: {
            ...initialState.assessments.sensoryProfile,
            ...parsed.assessments.sensoryProfile,
            progress: Math.max(parsed.assessments.sensoryProfile?.progress || 0, initialState.assessments.sensoryProfile.progress),
            domains: {
              ...initialState.assessments.sensoryProfile.domains,
              ...parsed.assessments.sensoryProfile.domains
            }
          },
          socialCommunication: {
            ...initialState.assessments.socialCommunication,
            ...parsed.assessments.socialCommunication,
            progress: Math.max(parsed.assessments.socialCommunication?.progress || 0, initialState.assessments.socialCommunication.progress),
            domains: {
              ...initialState.assessments.socialCommunication.domains,
              ...parsed.assessments.socialCommunication.domains
            }
          },
          behaviorInterests: {
            ...initialState.assessments.behaviorInterests,
            ...parsed.assessments.behaviorInterests,
            progress: Math.max(parsed.assessments.behaviorInterests?.progress || 0, initialState.assessments.behaviorInterests.progress),
            domains: {
              ...initialState.assessments.behaviorInterests.domains,
              ...parsed.assessments.behaviorInterests.domains
            }
          },
          milestones: {
            ...initialState.assessments.milestones,
            ...parsed.assessments.milestones,
            progress: Math.max(parsed.assessments.milestones?.progress || 0, initialState.assessments.milestones.progress)
          },
          assessmentLog: {
            ...initialState.assessments.assessmentLog,
            ...parsed.assessments.assessmentLog,
            progress: Math.max(parsed.assessments.assessmentLog?.progress || 0, initialState.assessments.assessmentLog.progress)
          }
        }
      };
      
      console.log(`✅ [${hookId.current}] Successfully restored state in ${componentName.current}`, {
        formProgress: restoredState.formData.formProgress,
        assessmentProgress: {
          sensory: restoredState.assessments.sensoryProfile.progress,
          social: restoredState.assessments.socialCommunication.progress,
          behavior: restoredState.assessments.behaviorInterests.progress,
          milestones: restoredState.assessments.milestones.progress,
          assessmentLog: restoredState.assessments.assessmentLog.progress
        }
      });
      
      return restoredState;
    } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to restore state in ${componentName.current}:`, error);
      return initialState;
    }
  });

  // Save state when it changes
  useEffect(() => {
    const hasContent = 
      globalState.formData?.clinicalObservations ||
      globalState.formData?.strengths ||
      globalState.formData?.priorityAreas ||
      globalState.formData?.recommendations;
    
    const hasProgress = 
      globalState.formData?.formProgress > 0 ||
      globalState.assessments?.sensoryProfile.progress > 0 ||
      globalState.assessments?.socialCommunication.progress > 0 ||
      globalState.assessments?.behaviorInterests.progress > 0 ||
      globalState.assessments?.milestones.progress > 0 ||
      globalState.assessments?.assessmentLog.progress > 0;
    
    if ((hasContent || hasProgress) && globalState !== initialState) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      const saveState = () => {
        try {
          const storageKey = getStorageKey(globalState.chataId);
          const stateToSave = {
            ...globalState,
            lastUpdated: new Date().toISOString()
          };
          
          localStorage.setItem(storageKey, JSON.stringify(stateToSave));
          console.log(`💾 [${hookId.current}] Successfully saved state from ${componentName.current}`);
          
          // Verify the save was successful
          const savedState = localStorage.getItem(storageKey);
          if (!savedState) {
            throw new Error('State was not saved properly');
          }
          
          const parsedSavedState = JSON.parse(savedState);
          if (!isValidState(parsedSavedState)) {
            throw new Error('Saved state is invalid');
          }
        } catch (error) {
          console.error(`❌ [${hookId.current}] Failed to save state in ${componentName.current}:`, error);
          
          // Retry once on failure
          setTimeout(() => {
            try {
              const storageKey = getStorageKey(globalState.chataId);
              localStorage.setItem(storageKey, JSON.stringify({
                ...globalState,
                lastUpdated: new Date().toISOString()
              }));
              console.log(`💾 [${hookId.current}] Successfully saved state on retry from ${componentName.current}`);
            } catch (retryError) {
              console.error(`❌ [${hookId.current}] Failed to save state on retry in ${componentName.current}:`, retryError);
            }
          }, 500);
        }
      };

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          saveState();
          saveTimeoutRef.current = null;
        });
      }, SAVE_DELAY);
    }
  }, [globalState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        
        // Final save on unmount if there's a pending save
        const storageKey = getStorageKey(globalState.chataId);
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            ...globalState,
            lastUpdated: new Date().toISOString()
          }));
          console.log(`💾 [${hookId.current}] Successfully saved state on unmount from ${componentName.current}`);
        } catch (error) {
          console.error(`❌ [${hookId.current}] Failed to save state on unmount in ${componentName.current}:`, error);
        }
        
        saveTimeoutRef.current = null;
      }
    };
  }, [globalState]);

  // Keep the existing update functions
  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates,
        lastUpdated: new Date().toISOString()
      }
    }));
  }, []);

  const updateAssessment = useCallback((type: keyof AssessmentData, data: Partial<AssessmentData[keyof AssessmentData]>) => {
    setGlobalState(prev => ({
      ...prev,
      assessments: {
        ...prev.assessments,
        [type]: {
          ...prev.assessments[type],
          ...data
        }
      }
    }));
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    setGlobalState(prev => ({
      ...prev,
      clinician: info,
      chataId: info.chataId || prev.chataId
    }));
  }, []);

  const clearState = useCallback(() => {
    const storageKey = getStorageKey(globalState.chataId);
    localStorage.removeItem(storageKey);
    setGlobalState({
      ...initialState,
      status: 'draft',
      lastUpdated: new Date().toISOString()
    });
  }, [globalState.chataId]);

  return {
    globalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};