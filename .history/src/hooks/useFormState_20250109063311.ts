import { useState, useEffect, useCallback } from 'react';
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
  isAssessmentLogData
} from '../types';

interface GlobalFormState {
  chataId: string;
  clinician: ClinicianInfo;
  formData: FormState;
  assessments: AssessmentData;
  currentStep: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}

const STORAGE_KEY = 'chata-form-state';
const SAVE_DELAY = 2000; // 2 seconds
const MIN_SAVE_INTERVAL = 1000; // 1 second minimum between saves

let saveTimeout: NodeJS.Timeout | null = null;
let lastSaveTime = 0;

export { STORAGE_KEY };

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

// Add helper function for milestone state handling
function processMilestoneData(
  saved: Partial<MilestoneTrackerData> | undefined,
  initial: MilestoneTrackerData
): MilestoneTrackerData {
  if (!saved) return initial;

  // Deep clone the milestones to avoid reference issues
  const processedMilestones = saved.milestones?.filter(isMilestone).map(m => ({
    ...m,
    actualAge: m.actualAge,
    stackPosition: m.stackPosition,
    status: m.status || 'pending'
  })) || initial.milestones;

  // Deep clone the custom milestones
  const processedCustomMilestones = saved.customMilestones?.filter(isMilestone).map(m => ({
    ...m,
    actualAge: m.actualAge,
    stackPosition: m.stackPosition,
    status: m.status || 'pending'
  })) || [];

  return {
    type: 'milestoneTracker',
    milestones: processedMilestones,
    customMilestones: processedCustomMilestones,
    history: saved.history || '',
    progress: saved.progress || 0,
    formProgress: saved.formProgress || 0,
    isComplete: saved.isComplete || false,
    lastUpdated: saved.lastUpdated || new Date().toISOString()
  };
}

// Add helper function for assessment log state handling
function processAssessmentLogData(
  saved: Partial<AssessmentLogData> | undefined,
  initial: AssessmentLogData
): AssessmentLogData {
  if (!saved) return initial;

  // Validate and process selected assessments
  const processedSelectedAssessments = saved.selectedAssessments?.filter(isAssessmentEntry).map(assessment => ({
    id: assessment.id,
    name: assessment.name,
    status: assessment.status || 'pending',
    date: assessment.date || '',
    notes: assessment.notes || '',
    result: assessment.result || ''
  })) || [];

  // Validate and process entries with proper typing
  const processedEntries: Record<string, AssessmentEntry> = {};
  if (saved.entries) {
    Object.entries(saved.entries).forEach(([key, entry]) => {
      if (isAssessmentEntry(entry)) {
        processedEntries[key] = {
          id: entry.id,
          name: entry.name,
          status: entry.status || 'pending',
          date: entry.date || '',
          notes: entry.notes || '',
          result: entry.result || ''
        };
      }
    });
  }

  return {
    type: 'assessmentLog',
    selectedAssessments: processedSelectedAssessments,
    entries: processedEntries,
    progress: typeof saved.progress === 'number' ? saved.progress : 0,
    isComplete: Boolean(saved.isComplete),
    lastUpdated: saved.lastUpdated || new Date().toISOString()
  };
}

// Add this before the useFormState hook
function shouldSave(): boolean {
  const now = Date.now();
  const timeSinceLastSave = now - lastSaveTime;
  return timeSinceLastSave >= MIN_SAVE_INTERVAL;
}

export const useFormState = () => {
  // Load initial state from localStorage
  const [globalState, setGlobalState] = useState<GlobalFormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📥 Loading saved state:', {
          content: {
            clinicalObservations: parsed?.formData?.clinicalObservations?.length || 0,
            strengths: parsed?.formData?.strengths?.length || 0,
            priorityAreas: parsed?.formData?.priorityAreas?.length || 0,
            recommendations: parsed?.formData?.recommendations?.length || 0
          },
          progress: {
            form: parsed?.formData?.formProgress || 0,
            sensory: parsed?.assessments?.sensoryProfile?.progress || 0,
            social: parsed?.assessments?.socialCommunication?.progress || 0,
            behavior: parsed?.assessments?.behaviorInterests?.progress || 0,
            milestones: parsed?.assessments?.milestones?.progress || 0,
            assessmentLog: parsed?.assessments?.assessmentLog?.progress || 0
          },
          completion: {
            sensory: parsed?.assessments?.sensoryProfile?.isComplete || false,
            social: parsed?.assessments?.socialCommunication?.isComplete || false,
            behavior: parsed?.assessments?.behaviorInterests?.isComplete || false,
            milestones: parsed?.assessments?.milestones?.isComplete || false,
            assessmentLog: parsed?.assessments?.assessmentLog?.isComplete || false
          },
          domains: {
            sensory: Object.keys(parsed?.assessments?.sensoryProfile?.domains || {}).length,
            social: Object.keys(parsed?.assessments?.socialCommunication?.domains || {}).length,
            behavior: Object.keys(parsed?.assessments?.behaviorInterests?.domains || {}).length
          }
        });
        
        if (parsed && parsed.status === 'draft') {
          const restoredState = {
            ...initialState,
            ...parsed,
            formData: {
              ...initialFormData,
              ...parsed.formData,
              formProgress: parsed.formData?.formProgress || 0
            },
            assessments: {
              sensoryProfile: {
                type: 'sensoryProfile',
                domains: Object.fromEntries(
                  Object.entries(initialState.assessments.sensoryProfile.domains).map(([key, defaultDomain]) => {
                    const savedDomain = parsed.assessments?.sensoryProfile?.domains?.[key];
                    return [key, {
                      ...defaultDomain,
                      value: savedDomain?.value ?? defaultDomain.value,
                      observations: savedDomain?.observations ?? defaultDomain.observations,
                      label: savedDomain?.label ?? defaultDomain.label
                    }];
                  })
                ),
                progress: parsed.assessments?.sensoryProfile?.progress || 0,
                isComplete: parsed.assessments?.sensoryProfile?.isComplete || false
              },
              socialCommunication: {
                type: 'socialCommunication',
                domains: Object.fromEntries(
                  Object.entries(initialState.assessments.socialCommunication.domains).map(([key, defaultDomain]) => {
                    const savedDomain = parsed.assessments?.socialCommunication?.domains?.[key];
                    return [key, {
                      ...defaultDomain,
                      value: savedDomain?.value ?? defaultDomain.value,
                      observations: savedDomain?.observations ?? defaultDomain.observations,
                      label: savedDomain?.label ?? defaultDomain.label
                    }];
                  })
                ),
                progress: parsed.assessments?.socialCommunication?.progress || 0,
                isComplete: parsed.assessments?.socialCommunication?.isComplete || false
              },
              behaviorInterests: {
                type: 'behaviorInterests',
                domains: Object.fromEntries(
                  Object.entries(initialState.assessments.behaviorInterests.domains).map(([key, defaultDomain]) => {
                    const savedDomain = parsed.assessments?.behaviorInterests?.domains?.[key];
                    return [key, {
                      ...defaultDomain,
                      value: savedDomain?.value ?? defaultDomain.value,
                      observations: savedDomain?.observations ?? defaultDomain.observations,
                      label: savedDomain?.label ?? defaultDomain.label
                    }];
                  })
                ),
                progress: parsed.assessments?.behaviorInterests?.progress || 0,
                isComplete: parsed.assessments?.behaviorInterests?.isComplete || false
              },
              milestones: processMilestoneData(
                parsed.assessments?.milestones,
                initialState.assessments.milestones
              ),
              assessmentLog: processAssessmentLogData(
                parsed.assessments?.assessmentLog,
                initialState.assessments.assessmentLog
              )
            }
          };

          console.log('🔄 Restored state:', {
            sensoryDomains: Object.keys(restoredState.assessments.sensoryProfile.domains).length,
            socialDomains: Object.keys(restoredState.assessments.socialCommunication.domains).length,
            behaviorDomains: Object.keys(restoredState.assessments.behaviorInterests.domains).length,
            progress: {
              sensory: restoredState.assessments.sensoryProfile.progress,
              social: restoredState.assessments.socialCommunication.progress,
              behavior: restoredState.assessments.behaviorInterests.progress,
              milestones: restoredState.assessments.milestones.progress,
              assessmentLog: restoredState.assessments.assessmentLog.progress
            },
            completion: {
              sensory: restoredState.assessments.sensoryProfile.isComplete,
              social: restoredState.assessments.socialCommunication.isComplete,
              behavior: restoredState.assessments.behaviorInterests.isComplete,
              milestones: restoredState.assessments.milestones.isComplete,
              assessmentLog: restoredState.assessments.assessmentLog.isComplete
            }
          });
          
          return restoredState;
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore state:', error);
    }
    return initialState;
  });

  // Debounced save with type checking
  const saveState = useCallback((state: GlobalFormState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    if (!shouldSave()) {
      // If we're saving too frequently, delay the save
      saveTimeout = setTimeout(() => saveState(state), MIN_SAVE_INTERVAL);
      return;
    }

    saveTimeout = setTimeout(() => {
      try {
        if (!state.formData || !state.assessments) {
          console.error('❌ Invalid state structure');
          return;
        }
        
        lastSaveTime = Date.now();
        
        // Deep clone the state to ensure we don't lose nested structures
        const stateToSave = {
          ...state,
          lastUpdated: new Date().toISOString(),
          assessments: {
            sensoryProfile: {
              type: 'sensoryProfile',
              domains: Object.fromEntries(
                Object.entries(state.assessments.sensoryProfile.domains).map(([key, domain]) => [
                  key,
                  {
                    ...domain,
                    value: domain.value,
                    observations: [...domain.observations],
                    label: domain.label
                  }
                ])
              ),
              progress: state.assessments.sensoryProfile.progress,
              isComplete: state.assessments.sensoryProfile.isComplete
            },
            socialCommunication: {
              type: 'socialCommunication',
              domains: Object.fromEntries(
                Object.entries(state.assessments.socialCommunication.domains).map(([key, domain]) => [
                  key,
                  {
                    ...domain,
                    value: domain.value,
                    observations: [...domain.observations],
                    label: domain.label
                  }
                ])
              ),
              progress: state.assessments.socialCommunication.progress,
              isComplete: state.assessments.socialCommunication.isComplete
            },
            behaviorInterests: {
              type: 'behaviorInterests',
              domains: Object.fromEntries(
                Object.entries(state.assessments.behaviorInterests.domains).map(([key, domain]) => [
                  key,
                  {
                    ...domain,
                    value: domain.value,
                    observations: [...domain.observations],
                    label: domain.label
                  }
                ])
              ),
              progress: state.assessments.behaviorInterests.progress,
              isComplete: state.assessments.behaviorInterests.isComplete
            },
            milestones: {
              type: 'milestoneTracker',
              milestones: state.assessments.milestones.milestones.map(m => ({
                ...m,
                actualAge: m.actualAge,
                stackPosition: m.stackPosition,
                status: m.status || 'pending'
              })),
              customMilestones: state.assessments.milestones.customMilestones.map(m => ({
                ...m,
                actualAge: m.actualAge,
                stackPosition: m.stackPosition,
                status: m.status || 'pending'
              })),
              history: state.assessments.milestones.history,
              progress: state.assessments.milestones.progress,
              formProgress: state.assessments.milestones.formProgress,
              isComplete: state.assessments.milestones.isComplete,
              lastUpdated: new Date().toISOString()
            },
            assessmentLog: {
              type: 'assessmentLog',
              selectedAssessments: state.assessments.assessmentLog.selectedAssessments.map(assessment => ({
                id: assessment.id,
                name: assessment.name,
                status: assessment.status || 'pending',
                date: assessment.date || '',
                notes: assessment.notes || '',
                result: assessment.result || ''
              })),
              entries: Object.fromEntries(
                Object.entries(state.assessments.assessmentLog.entries).map(([key, entry]) => [
                  key,
                  {
                    id: entry.id,
                    name: entry.name,
                    status: entry.status || 'pending',
                    date: entry.date || '',
                    notes: entry.notes || '',
                    result: entry.result || ''
                  }
                ])
              ),
              progress: state.assessments.assessmentLog.progress,
              isComplete: state.assessments.assessmentLog.isComplete,
              lastUpdated: new Date().toISOString()
            }
          }
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('💾 Saved state:', {
          timestamp: new Date().toISOString(),
          content: {
            clinicalObservations: state.formData?.clinicalObservations?.length || 0,
            strengths: state.formData?.strengths?.length || 0,
            priorityAreas: state.formData?.priorityAreas?.length || 0,
            recommendations: state.formData?.recommendations?.length || 0
          },
          progress: {
            form: state.formData?.formProgress || 0,
            sensory: state.assessments?.sensoryProfile?.progress || 0,
            social: state.assessments?.socialCommunication?.progress || 0,
            behavior: state.assessments?.behaviorInterests?.progress || 0,
            milestones: state.assessments?.milestones?.progress || 0,
            assessmentLog: state.assessments?.assessmentLog?.progress || 0
          },
          completion: {
            sensory: state.assessments?.sensoryProfile?.isComplete || false,
            social: state.assessments?.socialCommunication?.isComplete || false,
            behavior: state.assessments?.behaviorInterests?.isComplete || false,
            milestones: state.assessments?.milestones?.isComplete || false,
            assessmentLog: state.assessments?.assessmentLog?.isComplete || false
          },
          domains: {
            sensory: Object.keys(state.assessments?.sensoryProfile?.domains || {}).length,
            social: Object.keys(state.assessments?.socialCommunication?.domains || {}).length,
            behavior: Object.keys(state.assessments?.behaviorInterests?.domains || {}).length
          },
          milestones: {
            total: stateToSave.assessments.milestones.milestones.length,
            placed: stateToSave.assessments.milestones.milestones.filter(m => m.actualAge !== undefined).length,
            custom: stateToSave.assessments.milestones.customMilestones.length,
            progress: stateToSave.assessments.milestones.progress,
            isComplete: stateToSave.assessments.milestones.isComplete
          }
        });
      } catch (error) {
        console.error('❌ Failed to save state:', error);
      }
    }, SAVE_DELAY);
  }, []);

  // Save state when it changes
  useEffect(() => {
    const hasContent = 
      globalState.formData?.clinicalObservations ||
      globalState.formData?.strengths ||
      globalState.formData?.priorityAreas ||
      globalState.formData?.recommendations;
    
    const hasProgress = 
      globalState.formData?.formProgress > 0 ||
      globalState.assessments?.sensoryProfile.progress > 0;
    
    if (hasContent || hasProgress) {
      console.log('🔄 Triggering save:', {
        hasContent,
        hasProgress,
        formProgress: globalState.formData?.formProgress
      });
      saveState(globalState);
    }
  }, [globalState, saveState]);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalState(initialState);
    console.log('🗑️ State cleared');
  }, []);

  const updateFormData = useCallback((updates: Partial<FormState>) => {
    setGlobalState(prev => {
      // Don't update if values haven't changed or if new progress is lower
      const hasValidChanges = Object.entries(updates).some(([key, value]) => {
        if (key === 'formProgress') {
          // For progress, only update if new value is higher
          const currentProgress = prev.formData.formProgress || 0;
          const newProgress = typeof value === 'number' ? value : 0;
          return newProgress > currentProgress;
        }
        return prev.formData[key as keyof FormState] !== value;
      });

      if (!hasValidChanges) {
        console.log('📝 Skipping form update:', {
          reason: 'No valid changes or lower progress',
          current: {
            progress: prev.formData.formProgress,
            content: {
              clinicalObservations: prev.formData.clinicalObservations?.length || 0,
              strengths: prev.formData.strengths?.length || 0,
              priorityAreas: prev.formData.priorityAreas?.length || 0,
              recommendations: prev.formData.recommendations?.length || 0
            }
          },
          updates
        });
        return prev;
      }

      console.log('📝 Applying form update:', {
        current: {
          progress: prev.formData.formProgress,
          content: {
            clinicalObservations: prev.formData.clinicalObservations?.length || 0,
            strengths: prev.formData.strengths?.length || 0,
            priorityAreas: prev.formData.priorityAreas?.length || 0,
            recommendations: prev.formData.recommendations?.length || 0
          }
        },
        updates
      });

      const currentProgress = prev.formData.formProgress || 0;
      const newProgress = typeof updates.formProgress === 'number' ? updates.formProgress : currentProgress;

      return {
      ...prev,
      formData: {
        ...prev.formData,
          ...updates,
          // Ensure progress never decreases
          formProgress: Math.max(currentProgress, newProgress),
          lastUpdated: new Date().toISOString()
        }
      };
    });
  }, []);

  const updateAssessment = useCallback((type: keyof AssessmentData, data: Partial<AssessmentData[keyof AssessmentData]>) => {
    setGlobalState(prev => {
      const prevAssessment = prev.assessments[type];
      
      // Handle domain updates specially for components that have domains
      if (
        (type === 'sensoryProfile' || 
         type === 'socialCommunication' || 
         type === 'behaviorInterests')
      ) {
        const assessment = prevAssessment as SensoryProfileData | SocialCommunicationData | BehaviorInterestsData;
        const updateData = data as Partial<typeof assessment>;
        
        if ('domains' in updateData) {
          const updatedDomains = {
            ...assessment.domains,
            ...updateData.domains
          };
          
          // Create new assessment state with properly merged domains
          const updatedAssessment = {
            ...assessment,
            ...updateData,
            domains: updatedDomains
          };
          
          return {
            ...prev,
            assessments: {
              ...prev.assessments,
              [type]: updatedAssessment
            }
          };
        }
      }
      
      // For non-domain updates, proceed as before
      return {
        ...prev,
        assessments: {
          ...prev.assessments,
          [type]: {
            ...prevAssessment,
            ...data
          }
        }
      };
    });
  }, []);

  const setClinicianInfo = useCallback((info: ClinicianInfo) => {
    setGlobalState(prev => {
      // Don't update if values haven't changed
      const hasChanges = Object.entries(info).some(
        ([key, value]) => prev.clinician[key as keyof ClinicianInfo] !== value
      );
      if (!hasChanges) return prev;

      return {
      ...prev,
        clinician: info,
        chataId: info.chataId || prev.chataId
  };
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