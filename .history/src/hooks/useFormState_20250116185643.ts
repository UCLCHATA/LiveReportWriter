import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import type { 
  ClinicianInfo, 
  AssessmentData,
  GlobalFormState,
  SensoryProfileData,
  SocialCommunicationData,
  BehaviorInterestsData,
  MilestoneTrackerData,
  AssessmentLogData,
  AssessmentSummaryData,
  AssessmentDomainBase,
  Milestone,
  AssessmentEntry,
  isMilestone,
  isMilestoneTrackerData,
  isAssessmentEntry,
  isAssessmentLogData,
  FormData
} from '../types/index';

// Constants
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
const initialFormData: FormData = {
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
  lastUpdated: new Date().toISOString(),
  differentialDiagnosis: '',
  developmentalConcerns: '',
  medicalHistory: '',
  familyHistory: ''
};

const initialState: GlobalFormState = {
  chataId: '',
  clinician: {
    name: '',
    email: '',
    clinicName: '',
    childFirstName: '',
    childLastName: '',
    childAge: '',
    childGender: '',
    chataId: ''
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

// Update validation function to check clinician info
function isValidState(state: any): state is GlobalFormState {
  if (!state || typeof state !== 'object') return false;
  if (!state.formData || !state.assessments) return false;
  
  // Check for required properties
  const requiredProps = ['chataId', 'clinician', 'currentStep', 'lastUpdated', 'status'];
  if (!requiredProps.every(prop => prop in state)) return false;

  // Validate clinician info
  const clinicianProps = ['name', 'email', 'clinicName', 'chataId'];
  if (!clinicianProps.every(prop => prop in state.clinician)) return false;
  
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
    // Get all localStorage keys
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Check for all possible prefixes and patterns
      if (
        key.startsWith(STORAGE_KEY_PREFIX) ||    // chata-form-*
        key.startsWith(DRAFT_KEY_PREFIX) ||      // chata-draft-*
        key.startsWith('chata_') ||              // Old format: chata_*
        key === ASSESSMENT_KEY ||                // Assessment data
        key === 'current_draft_id' ||            // Draft ID
        key === 'chata-assessment-data' ||       // Assessment data (old format)
        key === 'assessmentState' ||             // Legacy key
        key === 'chata_form_progress' ||         // Progress data
        key.includes('chata')                    // Any other chata-related data
      ) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed storage key: ${key}`);
    });

    console.log(`🧹 Cleared ${keysToRemove.length} storage items`);
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
        clinician: {
          ...initialState.clinician,
          ...parsed.clinician,
          chataId: existingChataId || parsed.chataId || parsed.clinician?.chataId || ''
        },
        formData: {
          ...initialState.formData,
          ...parsed.formData,
          formProgress: Math.max(parsed.formData?.formProgress || 0, initialState.formData.formProgress)
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

        localStorage.setItem(storageKey, JSON.stringify(state));
        lastSaveRef.current = now;
        console.log(`💾 [${hookId.current}] Successfully saved state from ${componentName.current}`);
      } catch (error) {
        console.error('Error saving form state:', error);
      }
    }, SAVE_DELAY),
    [lastSaveRef]
  );

  // Optimized state updates with batching
  const updateFormData = useCallback((updates: Partial<FormData>) => {
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
    setClinicianInfo,
    clearState
  };
};