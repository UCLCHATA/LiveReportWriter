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
  formData: {} as FormState,
  assessments: {
    sensoryProfile: {
      type: 'sensoryProfile',
      domains: {} as SensoryProfileData['domains'],
      progress: 0,
      isComplete: false
    },
    socialCommunication: {
      type: 'socialCommunication',
      domains: {} as SocialCommunicationData['domains'],
      progress: 0,
      isComplete: false
    },
    behaviorInterests: {
      type: 'behaviorInterests',
      domains: {} as BehaviorInterestsData['domains'],
      progress: 0,
          label: 'Moderate Impact'
        }
      },
      progress: 0,
      milestones: [],
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
    },
    summary: {
      type: 'summary',
      isComplete: false,
      lastUpdated: new Date().toISOString()
      selectedAssessments: [],
      entries: {},
  clinicianInfo: null
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
      
      // Ensure we preserve all progress values and assessment states
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
            progress: parsed.assessments.sensoryProfile?.progress || 0,
            domains: {
              ...initialState.assessments.sensoryProfile.domains,
              ...parsed.assessments.sensoryProfile.domains
            },
            isComplete: parsed.assessments.sensoryProfile?.isComplete || false
          },
          socialCommunication: {
            ...initialState.assessments.socialCommunication,
            ...parsed.assessments.socialCommunication,
            progress: parsed.assessments.socialCommunication?.progress || 0,
            domains: {
              ...initialState.assessments.socialCommunication.domains,
              ...parsed.assessments.socialCommunication.domains
            },
            isComplete: parsed.assessments.socialCommunication?.isComplete || false
          },
          behaviorInterests: {
            ...initialState.assessments.behaviorInterests,
            ...parsed.assessments.behaviorInterests,
            progress: parsed.assessments.behaviorInterests?.progress || 0,
            domains: {
              ...initialState.assessments.behaviorInterests.domains,
              ...parsed.assessments.behaviorInterests.domains
            },
            isComplete: parsed.assessments.behaviorInterests?.isComplete || false
          },
          milestones: {
            ...initialState.assessments.milestones,
            ...parsed.assessments.milestones,
            progress: parsed.assessments.milestones?.progress || 0,
            isComplete: parsed.assessments.milestones?.isComplete || false
          },
          assessmentLog: {
            ...initialState.assessments.assessmentLog,
            ...parsed.assessments.assessmentLog,
            progress: parsed.assessments.assessmentLog?.progress || 0,
            isComplete: parsed.assessments.assessmentLog?.isComplete || false
          }
        }
      };
      
      // Log detailed progress information
      console.log(`✅ [${hookId.current}] Successfully restored state in ${componentName.current}`, {
        formProgress: restoredState.formData.formProgress,
        assessmentProgress: {
          sensory: {
            progress: restoredState.assessments.sensoryProfile.progress,
            isComplete: restoredState.assessments.sensoryProfile.isComplete
          },
          social: {
            progress: restoredState.assessments.socialCommunication.progress,
            isComplete: restoredState.assessments.socialCommunication.isComplete
          },
          behavior: {
            progress: restoredState.assessments.behaviorInterests.progress,
            isComplete: restoredState.assessments.behaviorInterests.isComplete
          },
          milestones: {
            progress: restoredState.assessments.milestones.progress,
            isComplete: restoredState.assessments.milestones.isComplete
          },
          assessmentLog: {
            progress: restoredState.assessments.assessmentLog.progress,
            isComplete: restoredState.assessments.assessmentLog.isComplete
          }
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
    setGlobalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};