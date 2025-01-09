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
  const lastSaveTimeRef = useRef<number>(0);
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');

  // Simplified save state function
  const saveState = useCallback((state: GlobalFormState) => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    if (timeSinceLastSave < MIN_SAVE_INTERVAL) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
        saveTimeoutRef.current = setTimeout(() => saveState(state), MIN_SAVE_INTERVAL);
        return;
      }

    try {
      if (!isValidState(state)) {
        console.error(`❌ [${hookId.current}] Invalid state structure in ${componentName.current}:`, state);
            return;
          }
          
          // Deep clone the state to ensure we don't lose nested structures
          const stateToSave = {
            ...state,
            lastUpdated: new Date().toISOString(),
        formData: {
          ...state.formData,
          lastUpdated: new Date().toISOString()
        },
            assessments: {
          ...state.assessments,
              sensoryProfile: {
            ...state.assessments.sensoryProfile,
                domains: Object.fromEntries(
                  Object.entries(state.assessments.sensoryProfile.domains).map(([key, domain]) => [
                    key,
                { ...domain, observations: [...domain.observations] }
              ])
            )
              },
              socialCommunication: {
            ...state.assessments.socialCommunication,
                domains: Object.fromEntries(
                  Object.entries(state.assessments.socialCommunication.domains).map(([key, domain]) => [
                    key,
                { ...domain, observations: [...domain.observations] }
              ])
            )
              },
              behaviorInterests: {
            ...state.assessments.behaviorInterests,
                domains: Object.fromEntries(
                  Object.entries(state.assessments.behaviorInterests.domains).map(([key, domain]) => [
                    key,
                { ...domain, observations: [...domain.observations] }
              ])
            )
          },
          milestones: processMilestoneData(state.assessments.milestones, initialState.assessments.milestones),
          assessmentLog: processAssessmentLogData(state.assessments.assessmentLog, initialState.assessments.assessmentLog)
            }
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      lastSaveTimeRef.current = now;
      
      console.log(`💾 [${hookId.current}] Successfully saved state from ${componentName.current}`);
        } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to save state in ${componentName.current}:`, error);
    } finally {
        saveTimeoutRef.current = null;
      }
  }, []);

  // Load initial state from localStorage
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    restoreAttemptCount++;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const validation = validateSavedState(saved);

      if (validation.isValid && validation.state) {
        console.log(`✅ [${hookId.current}] Successfully restored state in ${componentName.current}`);
        return validation.state;
      }
    } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to restore state in ${componentName.current}:`, error);
    }
    return initialState;
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
      saveState(globalState);
    }
  }, [globalState, saveState]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // ... rest of the implementation ...
};