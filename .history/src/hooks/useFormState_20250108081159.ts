import { useState, useEffect, useCallback } from 'react';
import { FormState, ClinicianInfo, AssessmentData } from '../types';

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
let saveTimeout: NodeJS.Timeout | null = null;

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
      isComplete: false
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
            milestones: {
              component: parsed?.assessments?.milestones?.progress || 0,
              form: parsed?.assessments?.milestones?.formProgress || 0
            }
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
              ...initialState.assessments,
              sensoryProfile: {
                type: 'sensoryProfile',
                domains: {
                  ...initialState.assessments.sensoryProfile.domains,
                  ...parsed.assessments?.sensoryProfile?.domains
                },
                progress: parsed.assessments?.sensoryProfile?.progress || 0,
                isComplete: parsed.assessments?.sensoryProfile?.isComplete || false
              },
              socialCommunication: {
                type: 'socialCommunication',
                domains: {
                  ...initialState.assessments.socialCommunication.domains,
                  ...parsed.assessments?.socialCommunication?.domains
                },
                progress: parsed.assessments?.socialCommunication?.progress || 0,
                isComplete: parsed.assessments?.socialCommunication?.isComplete || false
              },
              behaviorInterests: {
                type: 'behaviorInterests',
                domains: {
                  ...initialState.assessments.behaviorInterests.domains,
                  ...parsed.assessments?.behaviorInterests?.domains
                },
                progress: parsed.assessments?.behaviorInterests?.progress || 0,
                isComplete: parsed.assessments?.behaviorInterests?.isComplete || false
              },
              milestones: {
                ...initialState.assessments.milestones,
                ...parsed.assessments?.milestones,
                milestones: [
                  ...initialState.assessments.milestones.milestones,
                  ...(parsed.assessments?.milestones?.customMilestones || [])
                ],
                customMilestones: parsed.assessments?.milestones?.customMilestones || [],
                progress: parsed.assessments?.milestones?.progress || 0,
                formProgress: parsed.assessments?.milestones?.formProgress || 0
              },
              assessmentLog: {
                ...initialState.assessments.assessmentLog,
                ...parsed.assessments?.assessmentLog,
                progress: parsed.assessments?.assessmentLog?.progress || 0
              }
            }
          };
          
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
    saveTimeout = setTimeout(() => {
      try {
        if (!state.formData || !state.assessments) {
          console.error('❌ Invalid state structure');
          return;
        }
        
        const stateToSave = {
          ...state,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('💾 Saved state:', {
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
            behavior: state.assessments?.behaviorInterests?.progress || 0
          }
        });
      } catch (error) {
        console.error('❌ Failed to save state:', error);
      }
    }, 2000);
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
      // Don't update if values haven't changed
      const hasChanges = Object.entries(data).some(
        ([key, value]) => prevAssessment[key as keyof typeof prevAssessment] !== value
      );
      if (!hasChanges) return prev;

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