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

// Base interface for all assessment domains
interface AssessmentDomainBase {
  name: string;
  value: number;
  observations: string[];
  label: string;
}

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
const STORAGE_KEY_PREFIX = 'chata-form';
const DRAFT_KEY_PREFIX = 'chata-draft';
const ASSESSMENT_KEY = 'chata-assessment-data';

export const getStorageKey = (chataId: string = '') => {
  // Use a different prefix for draft forms to avoid conflicts
  if (!chataId) {
    const draftId = localStorage.getItem('current_draft_id') || crypto.randomUUID();
    localStorage.setItem('current_draft_id', draftId);
    return `${DRAFT_KEY_PREFIX}-${draftId}`;
  }
  return `${STORAGE_KEY_PREFIX}-${chataId}`;
};

// Add function to check all storage locations for a Chata ID
const findChataIdInStorage = (): string | null => {
  // Check URL first
  const urlParams = new URLSearchParams(window.location.search);
  const chataIdFromUrl = urlParams.get('chataId');
  if (chataIdFromUrl) return chataIdFromUrl;

  // Check assessment data
  const assessmentData = localStorage.getItem(ASSESSMENT_KEY);
  if (assessmentData) {
    try {
      const parsed = JSON.parse(assessmentData);
      if (parsed.chataId) return parsed.chataId;
    } catch (error) {
      console.error('Error parsing assessment data:', error);
    }
  }

  // Check form storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.chataId) return parsed.chataId;
        }
      } catch (error) {
        console.error('Error checking storage key:', key, error);
      }
    }
  }

  return null;
};

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
    // Clear current form storage
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);

    // Clear assessment data
    localStorage.removeItem(ASSESSMENT_KEY);

    // Clear any draft ID
    localStorage.removeItem('current_draft_id');

    // Clear any other form storage with the same Chata ID
    const chataId = findChataIdInStorage();
    if (chataId) {
      localStorage.removeItem(getStorageKey(chataId));
    }

    console.log('🗑️ Cleared all form storage');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Add cleanup function for old drafts
const cleanupOldDrafts = () => {
  const MAX_DRAFT_AGE = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('chata-draft-')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          if (now - new Date(data.lastUpdated).getTime() > MAX_DRAFT_AGE) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Error cleaning up draft:', error);
      }
    }
  }
};

export const useFormState = () => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');
  const lastSaveRef = useRef<number>(Date.now());

  // Run cleanup on mount
  useEffect(() => {
    cleanupOldDrafts();
  }, []);

  // Load initial state from localStorage first
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      // First, try to find a Chata ID from any storage location
      const existingChataId = findChataIdInStorage();
      
      // If we're in a new form context, clear everything
      if (window.location.pathname.includes('/new')) {
        clearStorage();
        return initialState;
      }
      
      // Get the appropriate storage key
      const storageKey = getStorageKey(existingChataId || '');
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        return existingChataId ? { ...initialState, chataId: existingChataId } : initialState;
      }
      
      const parsed = JSON.parse(saved);
      if (!isValidState(parsed)) {
        // Even if state is invalid, preserve any Chata ID we found
        return { ...initialState, chataId: existingChataId || parsed?.chataId || '' };
      }
      
      // Ensure we preserve Chata ID and all progress values
      const restoredState: GlobalFormState = {
        ...initialState,
        ...parsed,
        chataId: existingChataId || parsed.chataId || '', // Prioritize existing Chata ID
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
      const existingChataId = findChataIdInStorage();
      return existingChataId ? { ...initialState, chataId: existingChataId } : initialState;
    }
  });

  // Optimize save operation with debounce and batching
  const saveState = useCallback(
    debounce((state: GlobalFormState) => {
      try {
        // Always use the current chataId for storage key
        const storageKey = getStorageKey(state.chataId);
        const now = Date.now();
        
        // Only save if enough time has passed
        if (now - lastSaveRef.current < MIN_SAVE_INTERVAL) {
          return;
        }

        // Ensure chataId is preserved in essential state
        const essentialState = {
          ...state,
          chataId: state.chataId, // Explicitly include chataId
          lastUpdated: new Date().toISOString(),
          assessments: Object.entries(state.assessments).reduce((acc, [key, value]) => {
            if (!value) return acc;
            
            // Only save non-empty domains and actual values
            const domains = value.domains ? Object.entries(value.domains).reduce((domainAcc, [domainKey, domain]) => {
              const typedDomain = domain as AssessmentDomainBase;
              if (typedDomain.value !== 0 || (typedDomain.observations && typedDomain.observations.length > 0)) {
                domainAcc[domainKey] = typedDomain;
              }
              return domainAcc;
            }, {} as Record<string, AssessmentDomainBase>) : undefined;

            acc[key as keyof AssessmentData] = {
              ...value,
              domains: domains || value.domains
            };
            return acc;
          }, {} as AssessmentData)
        };

        // Save to main storage
        localStorage.setItem(storageKey, JSON.stringify(essentialState));

        // Also update assessment data storage
        const assessmentData = {
          chataId: state.chataId,
          lastUpdated: new Date().toISOString(),
          assessments: essentialState.assessments
        };
        localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(assessmentData));

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