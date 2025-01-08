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
          value: 0, 
          observations: [],
          name: "Visual Processing",
          label: "Typical"
        },
        auditory: { 
          value: 0, 
          observations: [],
          name: "Auditory Processing",
          label: "Typical"
        },
        tactile: { 
          value: 0, 
          observations: [],
          name: "Tactile Processing",
          label: "Typical"
        },
        vestibular: { 
          value: 0, 
          observations: [],
          name: "Vestibular Processing",
          label: "Typical"
        },
        proprioceptive: { 
          value: 0, 
          observations: [],
          name: "Proprioceptive Processing",
          label: "Typical"
        },
        oral: { 
          value: 0, 
          observations: [],
          name: "Oral Processing",
          label: "Typical"
        }
      },
      progress: 0
    },
    socialCommunication: {
      type: 'socialCommunication',
      domains: {
        jointAttention: { 
          value: 0, 
          observations: [],
          name: "Joint Attention",
          label: "Age Appropriate"
        },
        nonverbalCommunication: { 
          value: 0, 
          observations: [],
          name: "Non-verbal Communication",
          label: "Age Appropriate"
        },
        verbalCommunication: { 
          value: 0, 
          observations: [],
          name: "Verbal Communication",
          label: "Age Appropriate"
        },
        socialUnderstanding: { 
          value: 0, 
          observations: [],
          name: "Social Understanding",
          label: "Age Appropriate"
        },
        playSkills: { 
          value: 0, 
          observations: [],
          name: "Play Skills",
          label: "Age Appropriate"
        },
        peerInteractions: { 
          value: 0, 
          observations: [],
          name: "Peer Interactions",
          label: "Age Appropriate"
        }
      },
      progress: 0
    },
    behaviorInterests: {
      type: 'behaviorInterests',
      domains: {
        repetitiveBehaviors: { 
          value: 0, 
          observations: [],
          name: "Repetitive Behaviors",
          label: "Not Present"
        },
        routinesRituals: { 
          value: 0, 
          observations: [],
          name: "Routines & Rituals",
          label: "Not Present"
        },
        specialInterests: { 
          value: 0, 
          observations: [],
          name: "Special Interests",
          label: "Not Present"
        },
        sensoryInterests: { 
          value: 0, 
          observations: [],
          name: "Sensory Interests",
          label: "Not Present"
        },
        emotionalRegulation: { 
          value: 0, 
          observations: [],
          name: "Emotional Regulation",
          label: "Not Present"
        },
        flexibility: { 
          value: 0, 
          observations: [],
          name: "Flexibility",
          label: "Not Present"
        }
      },
      progress: 0
    },
    milestones: {
      type: 'milestoneTracker',
      milestones: [
        {
          id: 'motor1',
          name: 'Head Control',
          expectedAge: 3,
          category: 'motor'
        },
        {
          id: 'motor2',
          name: 'Rolling Over',
          expectedAge: 6,
          category: 'motor'
        },
        {
          id: 'motor3',
          name: 'Sitting Independently',
          expectedAge: 8,
          category: 'motor'
        },
        {
          id: 'language1',
          name: 'First Words',
          expectedAge: 12,
          category: 'language'
        },
        {
          id: 'language2',
          name: 'Two-Word Phrases',
          expectedAge: 24,
          category: 'language'
        },
        {
          id: 'social1',
          name: 'Social Smile',
          expectedAge: 2,
          category: 'social'
        },
        {
          id: 'social2',
          name: 'Joint Attention',
          expectedAge: 9,
          category: 'social'
        },
        {
          id: 'cognitive1',
          name: 'Object Permanence',
          expectedAge: 8,
          category: 'cognitive'
        }
      ],
      categories: [
        { id: 'motor', name: 'Motor Development' },
        { id: 'language', name: 'Language & Communication' },
        { id: 'social', name: 'Social-Emotional' },
        { id: 'cognitive', name: 'Cognitive Development' }
      ],
      history: '',
      progress: 0
    },
    assessmentLog: {
      type: 'assessmentLog',
      selectedAssessments: [],
      entries: {},
      progress: 0
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
          assessments: {
            sensoryProfile: {
              progress: parsed?.assessments?.sensoryProfile?.progress || 0,
              complete: parsed?.assessments?.sensoryProfile?.isComplete || false,
              domains: Object.keys(parsed?.assessments?.sensoryProfile?.domains || {}).length
            },
            socialCommunication: {
              progress: parsed?.assessments?.socialCommunication?.progress || 0,
              complete: parsed?.assessments?.socialCommunication?.isComplete || false,
              domains: Object.keys(parsed?.assessments?.socialCommunication?.domains || {}).length
            },
            behaviorInterests: {
              progress: parsed?.assessments?.behaviorInterests?.progress || 0,
              complete: parsed?.assessments?.behaviorInterests?.isComplete || false,
              domains: Object.keys(parsed?.assessments?.behaviorInterests?.domains || {}).length
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
                ...initialState.assessments.sensoryProfile,
                ...parsed.assessments?.sensoryProfile,
                domains: {
                  ...initialState.assessments.sensoryProfile.domains,
                  ...parsed.assessments?.sensoryProfile?.domains
                },
                progress: parsed.assessments?.sensoryProfile?.progress || 0,
                isComplete: parsed.assessments?.sensoryProfile?.isComplete || false
              },
              socialCommunication: {
                ...initialState.assessments.socialCommunication,
                ...parsed.assessments?.socialCommunication,
                domains: {
                  ...initialState.assessments.socialCommunication.domains,
                  ...parsed.assessments?.socialCommunication?.domains
                },
                progress: parsed.assessments?.socialCommunication?.progress || 0,
                isComplete: parsed.assessments?.socialCommunication?.isComplete || false
              },
              behaviorInterests: {
                ...initialState.assessments.behaviorInterests,
                ...parsed.assessments?.behaviorInterests,
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
                  ...(parsed.assessments?.milestones?.milestones || [])
                    .filter((m: { id: string; isCustom?: boolean }) => 
                      m.isCustom || !initialState.assessments.milestones.milestones
                        .find(im => im.id === m.id)
                    )
                ],
                categories: [
                  ...initialState.assessments.milestones.categories,
                  ...(parsed.assessments?.milestones?.categories || [])
                    .filter((c: { id: string; isCustom?: boolean }) => 
                      c.isCustom || !initialState.assessments.milestones.categories
                        .find(ic => ic.id === c.id)
                    )
                ],
                history: parsed.assessments?.milestones?.history || '',
                progress: parsed.assessments?.milestones?.progress || 0,
                isComplete: parsed.assessments?.milestones?.isComplete || false
              },
              assessmentLog: {
                ...initialState.assessments.assessmentLog,
                ...parsed.assessments?.assessmentLog,
                selectedAssessments: parsed.assessments?.assessmentLog?.selectedAssessments || [],
                entries: parsed.assessments?.assessmentLog?.entries || {},
                progress: parsed.assessments?.assessmentLog?.progress || 0,
                isComplete: parsed.assessments?.assessmentLog?.isComplete || false
              }
            }
          };
          
          console.log('📤 Restored state:', {
            content: {
              clinicalObservations: restoredState.formData?.clinicalObservations?.length || 0,
              strengths: restoredState.formData?.strengths?.length || 0,
              priorityAreas: restoredState.formData?.priorityAreas?.length || 0,
              recommendations: restoredState.formData?.recommendations?.length || 0
            },
            assessments: {
              sensoryProfile: {
                progress: restoredState.assessments.sensoryProfile.progress,
                complete: restoredState.assessments.sensoryProfile.isComplete,
                domains: Object.keys(restoredState.assessments.sensoryProfile.domains).length
              },
              socialCommunication: {
                progress: restoredState.assessments.socialCommunication.progress,
                complete: restoredState.assessments.socialCommunication.isComplete,
                domains: Object.keys(restoredState.assessments.socialCommunication.domains).length
              },
              behaviorInterests: {
                progress: restoredState.assessments.behaviorInterests.progress,
                complete: restoredState.assessments.behaviorInterests.isComplete,
                domains: Object.keys(restoredState.assessments.behaviorInterests.domains).length
              },
              milestones: {
                progress: restoredState.assessments.milestones.progress,
                complete: restoredState.assessments.milestones.isComplete,
                count: restoredState.assessments.milestones.milestones.length
              },
              assessmentLog: {
                progress: restoredState.assessments.assessmentLog.progress,
                complete: restoredState.assessments.assessmentLog.isComplete,
                assessments: restoredState.assessments.assessmentLog.selectedAssessments.length,
                entries: Object.keys(restoredState.assessments.assessmentLog.entries).length
              }
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
            assessment: state.assessments?.sensoryProfile?.progress || 0
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