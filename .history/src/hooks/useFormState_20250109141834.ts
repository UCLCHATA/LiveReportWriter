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
const STORAGE_KEY = 'chata-form-state';
const SAVE_DELAY = 2000; // 2 seconds
const MIN_SAVE_INTERVAL = 1000; // 1 second minimum between saves
const MIN_OPERATION_INTERVAL = 500; // ms

// Keep only essential counters
let hookInstanceCount = 0;
let restoreAttemptCount = 0;

export const useFormState = () => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');

  // Load initial state from localStorage first
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialState;
      
      const parsed = JSON.parse(saved);
      if (!isValidState(parsed)) return initialState;
      
      console.log(`✅ [${hookId.current}] Successfully restored state in ${componentName.current}`);
      return parsed;
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
      
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...globalState,
            lastUpdated: new Date().toISOString()
          }));
          console.log(`💾 [${hookId.current}] Successfully saved state from ${componentName.current}`);
        } catch (error) {
          console.error(`❌ [${hookId.current}] Failed to save state in ${componentName.current}:`, error);
        } finally {
          saveTimeoutRef.current = null;
        }
      }, SAVE_DELAY);
    }
  }, [globalState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

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
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState({
      ...initialState,
      status: 'draft',
      lastUpdated: new Date().toISOString()
    });
  }, []);

  return {
    globalState,
    updateFormData,
    updateAssessment,
    setClinicianInfo,
    clearState
  };
};