import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
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
      milestones: [],
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
    },
    summary: {
      type: 'summary',
      progress: 0,
      isComplete: false,
      lastUpdated: new Date().toISOString()
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

// Add clearStorage function
export const clearStorage = () => {
  try {
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    console.log('🗑️ Cleared form storage');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

export const useFormState = () => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');
  const lastSaveRef = useRef<number>(Date.now());

  // Load initial state from localStorage first
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      
      // If we're in a new form context (check URL or other indicators)
      if (window.location.pathname.includes('/new')) {
        clearStorage();
        return initialState;
      }
      
      if (!saved) return initialState;
      
      const parsed = JSON.parse(saved);
      if (!isValidState(parsed)) return initialState;
      
      // Ensure we preserve all progress values and assessment states
      const restoredState: GlobalFormState = {
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
            type: 'sensoryProfile',
            progress: parsed.assessments.sensoryProfile?.progress || 0,
            isComplete: parsed.assessments.sensoryProfile?.isComplete || false,
            domains: {
              ...initialState.assessments.sensoryProfile!.domains,
              ...(parsed.assessments.sensoryProfile?.domains || {})
            }
          },
          socialCommunication: {
            type: 'socialCommunication',
            progress: parsed.assessments.socialCommunication?.progress || 0,
            isComplete: parsed.assessments.socialCommunication?.isComplete || false,
            domains: {
              ...initialState.assessments.socialCommunication!.domains,
              ...(parsed.assessments.socialCommunication?.domains || {})
            }
          },
          behaviorInterests: {
            type: 'behaviorInterests',
            progress: parsed.assessments.behaviorInterests?.progress || 0,
            isComplete: parsed.assessments.behaviorInterests?.isComplete || false,
            domains: {
              ...initialState.assessments.behaviorInterests!.domains,
              ...(parsed.assessments.behaviorInterests?.domains || {})
            }
          }
        }
      };
      
      return restoredState;
    } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to restore state in ${componentName.current}:`, error);
      return initialState;
    }
  });

  // Optimize save operation with debounce and batching
  const saveState = useCallback(
    debounce((state: GlobalFormState) => {
      try {
        const storageKey = getStorageKey(state.chataId);
        const now = Date.now();
        
        // Only save if enough time has passed
        if (now - lastSaveRef.current < MIN_SAVE_INTERVAL) {
          return;
        }

        // Only save essential data
        const essentialState = {
          ...state,
          assessments: Object.entries(state.assessments).reduce((acc, [key, value]) => {
            if (!value) return acc;
            // Only save non-empty domains and actual values
            const domains = value.domains ? Object.entries(value.domains).reduce((domainAcc, [domainKey, domain]) => {
              if (domain.value !== 0 || (domain.observations && domain.observations.length > 0)) {
                domainAcc[domainKey] = domain;
              }
              return domainAcc;
            }, {} as any) : undefined;

            acc[key] = {
              ...value,
              domains: domains || value.domains
            };
            return acc;
          }, {} as AssessmentData)
        };

        localStorage.setItem(storageKey, JSON.stringify(essentialState));
        lastSaveRef.current = now;
        console.log(`💾 [${hookId.current}] Successfully saved state from ${componentName.current}`);
      } catch (error) {
        console.error('Error saving form state:', error);
      }
    }, SAVE_DELAY),
    [lastSaveRef]
  );

  // Optimized state updates with batching
  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates,
          lastUpdated: new Date().toISOString()
        }
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Optimize state updates to batch related changes
  const updateAssessment = useCallback((
    type: keyof AssessmentData,
    updates: Partial<AssessmentData[keyof AssessmentData]>
  ) => {
    setGlobalState(prev => {
      const now = Date.now();
      if (now - lastSaveRef.current < MIN_OPERATION_INTERVAL) {
        return prev;
      }

      const newState = {
        ...prev,
        assessments: {
          ...prev.assessments,
          [type]: {
            ...prev.assessments[type],
            ...updates,
            lastUpdated: new Date().toISOString()
          }
        },
        lastUpdated: new Date().toISOString()
      };

      // Schedule save
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    setGlobalState(prev => {
      const newState = {
        ...prev,
        clinician: info,
        chataId: info.chataId || prev.chataId
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const clearState = useCallback(() => {
    const storageKey = getStorageKey(globalState.chataId);
    localStorage.removeItem(storageKey);
    const newState: GlobalFormState = {
      ...initialState,
      status: 'draft' as const,
      lastUpdated: new Date().toISOString()
    };
    setGlobalState(newState);
    saveState(newState);
  }, [globalState.chataId, saveState]);

  return {
    globalState,
    setGlobalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};