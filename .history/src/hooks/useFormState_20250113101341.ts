import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { 
  FormState, 
  ClinicianInfo, 
  AssessmentData,
  GlobalFormState
} from '../types';

// Constants
const SAVE_DELAY = 3000;
const MIN_SAVE_INTERVAL = 2000;
const MIN_OPERATION_INTERVAL = 1000;

// Keep track of hook instances
let hookInstanceCount = 0;

export const useFormState = () => {
  // Refs must be declared before any other hooks
  const hookId = useRef(`hook-${++hookInstanceCount}`);
  const componentName = useRef(new Error().stack?.split('\n')[2]?.trim()?.split(' ')[1] || 'unknown');
  const lastSaveRef = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<{[key: string]: any}>({});

  // State initialization
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (!saved) return initialState;
      
      const parsed = JSON.parse(saved);
      if (!isValidState(parsed)) return initialState;
      
      return {
        ...initialState,
        ...parsed,
        formData: {
          ...initialState.formData,
          ...parsed.formData,
          formProgress: Math.max(parsed.formData?.formProgress || 0, initialState.formData.formProgress)
        },
        assessments: {
          ...initialState.assessments,
          ...parsed.assessments
        }
      };
    } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to restore state:`, error);
      return initialState;
    }
  });

  // Memoized save function
  const saveState = useCallback((state: GlobalFormState) => {
    const now = Date.now();
    if (now - lastSaveRef.current < MIN_SAVE_INTERVAL) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveState(state);
      }, MIN_SAVE_INTERVAL);
      return;
    }

    const storageKey = getStorageKey(state.chataId);
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString()
      }));
      lastSaveRef.current = now;
    } catch (error) {
      console.error(`❌ [${hookId.current}] Failed to save state:`, error);
    }
  }, []);

  // Optimized update functions
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

  const updateAssessment = useCallback((type: keyof AssessmentData, data: Partial<AssessmentData[keyof AssessmentData]>) => {
    pendingUpdatesRef.current[type] = {
      ...pendingUpdatesRef.current[type],
      ...data
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};

      setGlobalState(prev => {
        const newState = {
          ...prev,
          assessments: Object.entries(updates).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: {
              ...prev.assessments[key as keyof AssessmentData],
              ...value,
              lastUpdated: new Date().toISOString()
            }
          }), {...prev.assessments})
        };
        saveState(newState);
        return newState;
      });
    }, MIN_OPERATION_INTERVAL);
  }, [saveState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    globalState,
    setGlobalState,
    updateFormData,
    updateAssessment
  };
};