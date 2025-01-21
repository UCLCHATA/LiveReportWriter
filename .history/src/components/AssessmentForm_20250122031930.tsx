import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFormState } from '../hooks/useFormState';
<<<<<<< HEAD
import { 
  ClipboardList, 
  Activity, 
  Users, 
  Star, 
  Lightbulb,
  MessageSquare,
  Search,
  HelpCircle,
  X
} from 'lucide-react';
import styles from './AssessmentForm.module.css';
=======
>>>>>>> fix-deployment
import html2canvas from 'html2canvas';
import { submitFormData } from '../services/api';
import { SubmissionOverlay } from './SubmissionOverlay';
<<<<<<< HEAD
import { APPS_SCRIPT_URL } from '../config/api';
import { makeAppsScriptCall } from '../utils/api';
import { submitFormData } from '../services/formSubmission';
import { Milestone } from '../types';
import { 
  AlertTriangle, 
  Dumbbell, 
  ThumbsUp
} from 'lucide-react';
=======
import type { Stage } from './SubmissionOverlay';
import type { GlobalFormState } from '../types';
import styles from './AssessmentForm.module.css';
import { 
  ClipboardList, Activity, Users, Star, Lightbulb,
  MessageSquare, Zap, Award, Brain, Sparkles,
  Target, Search, AlertTriangle, Dumbbell,
  ThumbsUp, HelpCircle, X
} from 'lucide-react';
import { SubmissionService } from '../services/submissionService';

interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childFirstName: string;
  childLastName: string;
  childAge: string;
  childGender: string;
  chataId: string;
}

interface FormData {
  status: 'draft' | 'submitted';
  ascStatus: string;
  adhdStatus: string;
  clinicalObservations: string;
  strengths: string;
  priorityAreas: string;
  recommendations: string;
  referrals: Record<string, boolean>;
  remarks: string;
  differentialDiagnosis: string;
  chartImage?: string;
  lastUpdated?: string;
  formProgress?: number;
  developmentalConcerns: string;
  medicalHistory: string;
  familyHistory: string;
  componentProgress: Record<string, { progress: number; isComplete: boolean }>;
}
>>>>>>> fix-deployment

interface WordCountState {
  count: number;
  status: 'under' | 'good' | 'over';
}

interface AssessmentFormProps {
  onClear: () => void;
  onProgressUpdate: (progress: number) => void;
  initialProgress?: number;
}

const getWordCountState = (text: string): 'insufficient' | 'minimal' | 'good' | 'excellent' => {
  const wordCount = text?.trim().split(/\s+/).filter(Boolean).length || 0;
  if (wordCount < 60) return 'insufficient';
  if (wordCount < 120) return 'minimal';
  if (wordCount < 180) return 'good';
  return 'excellent';
};

const getWordCountText = (text: string): string => {
  const wordCount = text?.trim().split(/\s+/).filter(Boolean).length || 0;
  if (wordCount < 60) return 'More detail needed';
  if (wordCount < 120) return 'Share a bit more';
  if (wordCount < 180) return 'Good detail';
  return 'Excellent detail';
};

const getTooltipContent = (section: string): string => {
  switch (section) {
    case 'Clinical Observations':
      return '• Document key behavioral observations\n• Note communication patterns\n• Record sensory responses\n• Describe social interactions\n• Include specific examples and contexts';
    case 'Strengths & Abilities':
      return '• Individual strengths and talents\n• Special interests and passions\n• Learning preferences and styles\n• Coping strategies and adaptations\n• Support systems and resources';
    case 'Priority Support Areas':
      return '• Key areas needing intervention\n• Impact on daily functioning\n• Family-identified priorities\n• School/community concerns\n• Time-sensitive needs';
    case 'Support Recommendations':
      return '• Evidence-based strategies\n• Environmental adaptations\n• Skill development goals\n• Family support plans\n• Professional interventions';
    case 'Status':
      return '• Current diagnostic status\n• Assessment findings\n• Clinical judgement\n• Differential considerations';
    case 'Referrals':
      return '• Specialist recommendations\n• Support services needed\n• Professional consultations\n• Follow-up assessments';
    default:
      return 'Enter relevant information for this section';
  }
};

const TextAreaWithOverlay: React.FC<{
  value: string;
  name: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onDoubleClick?: () => void;
}> = ({ value, name, placeholder, onChange, onFocus, onBlur, onKeyDown, onDoubleClick }) => {
  const isExcellent = getWordCountState(value) === 'excellent';

  return (
    <div className={styles.textAreaWrapper}>
      <textarea 
        className={styles.textArea}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onDoubleClick={onDoubleClick}
      />
      {isExcellent && <div className={styles.textAreaOverlay} />}
    </div>
  );
};

<<<<<<< HEAD
type SensoryLabel = "Typical" | "Significantly Under-responsive" | "Under-responsive" | "Over-responsive" | "Significantly Over-responsive";

type SensoryDomain = {
  label: SensoryLabel;
  name: string;
  value: number;
  observations: string[];
};

const getSliderLabel = (domain: { label?: SensoryLabel; value?: number }) => {
  const value = domain?.value ?? 3;
  const baseLabel = domain?.label ?? 'Typical';
  return `${baseLabel} (${value}/5)` as SensoryLabel;
};

const getDomainValue = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 3;
};

const getObservations = (observations: string | string[] | undefined): string[] => {
  if (Array.isArray(observations)) return observations;
  if (typeof observations === 'string') return [observations];
  return [];
};

const getSensoryDomain = (domain: any): SensoryDomain => ({
  label: domain?.label || 'Typical',
  name: domain?.name || '',
  value: getDomainValue(domain?.value),
  observations: getObservations(domain?.observations)
});

=======
type SubmissionStage = 'submission' | 'waiting' | 'complete' | 'error';

const getStageMessage = (stage: SubmissionStage) => {
  switch (stage) {
    case 'submission':
      return 'Submitting form data...';
    case 'waiting':
      return 'Verifying submission...';
    case 'complete':
      return 'Form submitted successfully!';
    case 'error':
      return 'Error submitting form';
    default:
      return '';
  }
};

>>>>>>> fix-deployment
export const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
  onClear, 
  onProgressUpdate,
  initialProgress = 0
}) => {
  const { globalState, updateFormData, clearState } = useFormState();
  const [wordCounts, setWordCounts] = useState<Record<string, WordCountState>>({});
  const lastProgress = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>('submission');
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionDetails, setSubmissionDetails] = useState<{ documentUrl?: string; emailStatus?: string }>();
  
  // Add modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: '',
    field: ''
  });

  const chartRef = useRef<HTMLDivElement>(null);

  // Initialize with saved progress
  useEffect(() => {
    if (!isInitialized && initialProgress > 0) {
      lastProgress.current = initialProgress;
      setIsInitialized(true);
    }
  }, [isInitialized, initialProgress]);

  // Calculate progress whenever form fields change
  useEffect(() => {
    if (!globalState?.formData) return;

    const calculateProgress = () => {
      let progress = 0;
      
      // Text boxes contribute 40% (10% each)
      const textFields = {
        clinicalObservations: globalState.formData.clinicalObservations,
        strengthsAbilities: globalState.formData.strengths,
        prioritySupportAreas: globalState.formData.priorityAreas,
        supportRecommendations: globalState.formData.recommendations
      };
      
      // Calculate progress based on word count status
      Object.values(textFields).forEach(field => {
        if (field?.trim()) {
          const status = getWordCountState(field);
          switch (status) {
            case 'minimal':
              progress += 5;
              break;
            case 'good':
              progress += 7.5;
              break;
            case 'excellent':
              progress += 10;
              break;
          }
        }
      });

      // Status fields contribute 5% (2.5% each)
      if (globalState.formData.ascStatus && globalState.formData.ascStatus !== '') {
        progress += 2.5;
      }
      if (globalState.formData.adhdStatus && globalState.formData.adhdStatus !== '') {
        progress += 2.5;
      }

      // Professional referrals contribute 5%
      const hasReferrals = Object.values(globalState.formData.referrals || {}).some(value => value === true);
      if (hasReferrals) {
        progress += 5;
      }

      // Convert to percentage of total (this is 50% of total progress)
      progress = Math.min(50, progress);

      return progress;
    };

    const newProgress = calculateProgress();
    
    // Only update if progress has actually changed
    if (newProgress !== lastProgress.current) {
      lastProgress.current = newProgress;
      onProgressUpdate(newProgress);
      
      // Update form progress in global state
      updateFormData({
        formProgress: newProgress,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [
    globalState?.formData?.clinicalObservations,
    globalState?.formData?.strengths,
    globalState?.formData?.priorityAreas,
    globalState?.formData?.recommendations,
    globalState?.formData?.ascStatus,
    globalState?.formData?.adhdStatus,
    globalState?.formData?.referrals,
    onProgressUpdate,
    updateFormData
  ]);

  // Add handlers for component progress
  const handleComponentComplete = useCallback((componentId: string, isComplete: boolean) => {
    if (!globalState?.formData?.componentProgress) return;
    const currentProgress = globalState.formData.componentProgress[componentId]?.progress ?? 0;
    updateFormData({
      componentProgress: {
        ...globalState.formData.componentProgress,
        [componentId]: {
          progress: currentProgress,
          isComplete
        }
      }
    });
  }, [globalState?.formData?.componentProgress, updateFormData]);

  const handleComponentProgressUpdate = useCallback((componentId: string, progress: number) => {
    if (!globalState?.formData?.componentProgress) return;
    const currentIsComplete = globalState.formData.componentProgress[componentId]?.isComplete ?? false;
    updateFormData({
      componentProgress: {
        ...globalState.formData.componentProgress,
        [componentId]: {
          progress,
          isComplete: currentIsComplete
        }
      }
    });
  }, [globalState?.formData?.componentProgress, updateFormData]);

  useEffect(() => {
    if (!globalState.formData) {
      updateFormData({
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
        status: 'draft',
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Ensure referrals object has all required fields
      const currentReferrals = globalState.formData.referrals || {};
      const updatedReferrals = {
        speech: currentReferrals.speech || false,
        educational: currentReferrals.educational || false,
        sleep: currentReferrals.sleep || false,
        occupational: currentReferrals.occupational || false,
        mental: currentReferrals.mental || false,
        other: currentReferrals.other || false
      };
      
      // Update if referrals structure has changed
      if (JSON.stringify(currentReferrals) !== JSON.stringify(updatedReferrals)) {
        updateFormData({
          referrals: updatedReferrals,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, []);

  if (!globalState.formData) {
    return <div>Loading...</div>;
  }

  const formData = globalState.formData;

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    updateFormData({ 
      [field]: value
    });
  };

  const handleCheckboxChange = (field: keyof typeof formData.referrals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedReferrals = {
      ...formData.referrals,
      [field]: e.target.checked
    };
    
    updateFormData({
      referrals: updatedReferrals
    });
  };

  const handleStatusChange = async (newStatus: 'draft' | 'submitted') => {
    if (newStatus === 'submitted') {
<<<<<<< HEAD
      // Validate essential fields
      const requiredFields = {
        'ASC Status': formData.ascStatus,
        'ADHD Status': formData.adhdStatus,
        'Clinical Observations': formData.clinicalObservations,
        'Strengths & Abilities': formData.strengths,
        'Priority Support Areas': formData.priorityAreas,
        'Support Recommendations': formData.recommendations
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
        return;
      }

      // Validate word count for text boxes
      const textFields = {
        'Clinical Observations': formData.clinicalObservations,
        'Strengths & Abilities': formData.strengths,
        'Priority Support Areas': formData.priorityAreas,
        'Support Recommendations': formData.recommendations
      };

      const insufficientDetailFields = Object.entries(textFields)
        .filter(([_, value]) => getWordCountState(value) === 'insufficient' || getWordCountState(value) === 'minimal')
        .map(([key]) => key);

      if (insufficientDetailFields.length > 0) {
        alert(`Please provide more detail (at least "Good Detail" level) for the following fields:\n${insufficientDetailFields.join('\n')}`);
        return;
      }

=======
>>>>>>> fix-deployment
      try {
        setSubmissionStage('submission');
        setSubmissionProgress(0);

<<<<<<< HEAD
        // Capture the combined radar chart image if it exists
        const combinedRadarChart = document.querySelector('.combined-radar-chart') as HTMLElement;
        let radarChartImage = '';
        
        if (combinedRadarChart) {
          try {
            const canvas = await html2canvas(combinedRadarChart);
            radarChartImage = canvas.toDataURL('image/png');
            console.log('Successfully captured radar chart image');
          } catch (error) {
            console.error('Failed to capture radar chart:', error);
          }
        }

        // Submit form data using the new service
        const sheetyResponse = await submitFormData({
          formData: {
            ...formData,
            milestones: globalState.assessments.milestones?.milestones.map(m => ({
              ...m,
              status: m.status === 'advanced' ? 'typical' : m.status
            })) as Milestone[],
            milestoneHistory: globalState.assessments.milestones?.history || '',
            timelineImage: globalState.assessments.milestones?.includeTimelineInReport ? globalState.assessments.milestones?.timelineImage : ''
          },
          globalState: {
            chataId: globalState.clinician?.chataId || '',
            clinician: {
              chataId: globalState.clinician?.chataId || '',
              clinicName: globalState.clinician?.clinicName || '',
              name: globalState.clinician?.name || '',
              email: globalState.clinician?.email || '',
              childFirstName: globalState.clinician?.childFirstName || '',
              childSecondName: globalState.clinician?.childSecondName || '',
              childAge: globalState.clinician?.childAge || '',
              childGender: globalState.clinician?.childGender || ''
            },
            formData: globalState.formData,
            assessments: {
              sensoryProfile: {
                type: 'sensoryProfile',
                domains: {
                  visual: getSensoryDomain(globalState.assessments.sensoryProfile.domains.visual),
                  auditory: getSensoryDomain(globalState.assessments.sensoryProfile.domains.auditory),
                  tactile: getSensoryDomain(globalState.assessments.sensoryProfile.domains.tactile),
                  vestibular: getSensoryDomain(globalState.assessments.sensoryProfile.domains.vestibular),
                  proprioceptive: getSensoryDomain(globalState.assessments.sensoryProfile.domains.proprioceptive),
                  oral: getSensoryDomain(globalState.assessments.sensoryProfile.domains.oral)
                },
                progress: globalState.assessments.sensoryProfile.progress,
                isComplete: globalState.assessments.sensoryProfile.isComplete
              },
              socialCommunication: {
                type: 'socialCommunication',
                domains: {
                  jointAttention: { 
                    label: 'Age Appropriate', 
                    name: 'jointAttention', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.jointAttention?.observations)
                  },
                  nonverbalCommunication: { 
                    label: 'Age Appropriate', 
                    name: 'nonverbalCommunication', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations)
                  },
                  verbalCommunication: { 
                    label: 'Age Appropriate', 
                    name: 'verbalCommunication', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.verbalCommunication?.observations)
                  },
                  socialUnderstanding: { 
                    label: 'Age Appropriate', 
                    name: 'socialUnderstanding', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations)
                  },
                  playSkills: { 
                    label: 'Age Appropriate', 
                    name: 'playSkills', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.playSkills?.observations)
                  },
                  peerInteractions: { 
                    label: 'Age Appropriate', 
                    name: 'peerInteractions', 
                    value: 5, 
                    observations: getObservations(globalState.assessments.socialCommunication.domains.peerInteractions?.observations)
                  }
                },
                progress: globalState.assessments.socialCommunication.progress,
                isComplete: globalState.assessments.socialCommunication.isComplete
              },
              behaviorInterests: {
                type: 'behaviorInterests',
                domains: {
                  repetitiveBehaviors: { 
                    label: 'Not Present', 
                    name: 'repetitiveBehaviors', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations)
                  },
                  routinesRituals: { 
                    label: 'Not Present', 
                    name: 'routinesRituals', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.routinesRituals?.observations)
                  },
                  specialInterests: { 
                    label: 'Not Present', 
                    name: 'specialInterests', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.specialInterests?.observations)
                  },
                  sensoryInterests: { 
                    label: 'Not Present', 
                    name: 'sensoryInterests', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations)
                  },
                  emotionalRegulation: { 
                    label: 'Not Present', 
                    name: 'emotionalRegulation', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations)
                  },
                  flexibility: { 
                    label: 'Not Present', 
                    name: 'flexibility', 
                    value: 1, 
                    observations: getObservations(globalState.assessments.behaviorInterests.domains.flexibility?.observations)
                  }
                },
                progress: globalState.assessments.behaviorInterests.progress,
                isComplete: globalState.assessments.behaviorInterests.isComplete
              },
              assessmentLog: {
                type: 'assessmentLog',
                selectedAssessments: [],
                entries: Object.entries(globalState.assessments.assessmentLog.entries).reduce((acc, [key, entry]) => ({
                  ...acc,
                  [key]: {
                    id: key,
                    name: entry.name,
                    date: entry.date,
                    notes: entry.notes,
                    color: '#4299E1',
                    category: 'assessment',
                    status: entry.status || 'pending',
                    addedAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                  }
                }), {}),
                progress: globalState.assessments.assessmentLog.progress,
                isComplete: globalState.assessments.assessmentLog.isComplete
              },
              milestones: {
                type: 'milestoneTracker',
                milestones: globalState.assessments.milestones.milestones.map(milestone => ({
                  ...milestone,
                  status: milestone.status === 'advanced' ? 'typical' : milestone.status
                })),
                customMilestones: globalState.assessments.milestones.milestones
                  .filter(m => m.id.startsWith('custom-concern-'))
                  .map(milestone => ({
                    ...milestone,
                    status: milestone.status === 'advanced' ? 'typical' : milestone.status
                  })),
                history: globalState.assessments.milestones.history,
                progress: globalState.assessments.milestones.progress,
                formProgress: globalState.assessments.milestones.formProgress,
                isComplete: globalState.assessments.milestones.isComplete,
                lastUpdated: new Date().toISOString()
              },
              summary: {
                type: 'summary',
                lastUpdated: new Date().toISOString()
              }
            },
            currentStep: globalState.currentStep,
            lastUpdated: globalState.lastUpdated,
            status: globalState.status
          },
          radarChartImage
        });

        console.log('Successfully saved to Google Sheet via Sheety API:', sheetyResponse);
        
        // Update form data status after successful submission
        updateFormData({ 
          status: newStatus,
          ...(radarChartImage && { radarChartImage })
        });

        setSubmissionProgress(30);
        setSubmissionStage('template');

        // After successful Sheety submission, trigger Apps Script workflow
        console.log('Starting Apps Script workflow for CHATA ID:', globalState.clinician?.chataId);
        
        const templateResult = await makeAppsScriptCall(
          APPS_SCRIPT_URLS.template,
          globalState.clinician?.chataId
        );

        if (!templateResult.success) {
          console.error('Template stage failed:', templateResult.error);
          throw new Error(`Template stage failed: ${templateResult.error || 'Unknown error'}`);
        }

        console.log('Template stage completed successfully');
        setSubmissionProgress(100);
        setSubmissionStage('email');
        setSubmissionDetails({
          documentUrl: templateResult.documentUrl,
          emailStatus: templateResult.emailStatus || 'Report generated successfully'
        });

        if (templateResult.documentUrl) {
          window.open(templateResult.documentUrl, '_blank');
        }
=======
        // Get the current CHATA ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentChataId = urlParams.get('chataId');

        if (!currentChataId) {
          throw new Error('No CHATA ID found in URL');
        }

        // Log the current state before submission
        console.log('Current state before submission:', {
          assessments: globalState.assessments ? 'present' : 'missing',
          sensoryProfile: globalState.assessments?.sensoryProfile ? 'present' : 'missing',
          socialCommunication: globalState.assessments?.socialCommunication ? 'present' : 'missing',
          behaviorInterests: globalState.assessments?.behaviorInterests ? 'present' : 'missing',
          milestones: globalState.assessments?.milestones ? 'present' : 'missing',
          assessmentLog: globalState.assessments?.assessmentLog ? 'present' : 'missing'
        });

        setSubmissionProgress(50);

        // Submit form data using the SubmissionService
        const result = await SubmissionService.submit(
          globalState, 
          true,
          chartRef.current
        );

        if (!result.success) {
          throw new Error(result.error || 'Submission failed');
        }

        setSubmissionProgress(100);
        setSubmissionStage('complete');

        // Update form status after successful submission
        updateFormData({ 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        });
>>>>>>> fix-deployment

      } catch (error) {
        console.error('Form submission error:', error);
        setSubmissionStage('error');
<<<<<<< HEAD
        // Show error message to user with more context
        const errorMessage = error instanceof Error ? 
          error.message : 
          'Unknown error occurred';
        alert(`Submission failed: ${errorMessage}\n\nPlease try again. If the problem persists, contact support.`);
=======
>>>>>>> fix-deployment
      }
    } else {
      updateFormData({ status: newStatus });
    }
  };

  const handleClear = () => {
    clearState();
    onClear();
  };

  const [focusedTextArea, setFocusedTextArea] = useState<string | null>(null);

  const handleTextAreaFocus = (field: string) => () => {
    setFocusedTextArea(field);
  };

  const handleTextAreaBlur = () => {
    setFocusedTextArea(null);
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const cursorPosition = target.selectionStart;
      const currentValue = target.value;
      const textBeforeCursor = currentValue.substring(0, cursorPosition);
      const textAfterCursor = currentValue.substring(cursorPosition);
      
      // Check if we're in a list
      const lastLine = textBeforeCursor.split('\n').pop() || '';
      const bulletMatch = lastLine.match(/^[•\-]\s*/);
      
      if (bulletMatch && lastLine.trim() === bulletMatch[0].trim()) {
        // Empty bullet point, remove it
        const newValue = textBeforeCursor.substring(0, cursorPosition - lastLine.length) + textAfterCursor;
        updateFormData({ [target.name]: newValue });
        target.selectionStart = cursorPosition - lastLine.length;
        target.selectionEnd = cursorPosition - lastLine.length;
      } else {
        // Add new bullet point
        const bullet = bulletMatch ? bulletMatch[0] : '• ';
        const newValue = textBeforeCursor + '\n' + bullet + textAfterCursor;
        updateFormData({ [target.name]: newValue });
        const newPosition = cursorPosition + bullet.length + 1;
        target.selectionStart = newPosition;
        target.selectionEnd = newPosition;
      }
    }
  };

  const handleSectionDoubleClick = (field: string, content: string) => {
    const title = field === 'clinicalObservations' ? 'Clinical Observations' :
                 field === 'strengths' ? 'Strengths & Abilities' :
                 field === 'priorityAreas' ? 'Priority Support Areas' :
                 'Support Recommendations';
                 
    setModalContent({
      title,
      content,
      field
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalContent({
      title: '',
      content: '',
      field: ''
    });
  };

  const handleModalContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({
      [modalContent.field]: e.target.value
    });
    setModalContent(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const cursorPosition = target.selectionStart;
      const value = target.value;
      
      // Add bullet point for new lines
      const newValue = value.slice(0, cursorPosition) + '\n• ' + value.slice(cursorPosition);
      updateFormData({ [modalContent.field]: newValue });
      setModalContent(prev => ({
        ...prev,
        content: newValue
      }));
      
      // Set cursor position after bullet point
      setTimeout(() => {
        target.selectionStart = cursorPosition + 3;
        target.selectionEnd = cursorPosition + 3;
      }, 0);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!globalState) return;
    
    try {
      const result = await SubmissionService.submit(
        globalState, 
        true,
        chartRef.current
      );

      if (result.success) {
        // Handle successful submission
        setSubmissionStage('complete');
      } else {
        // Handle submission error
        setSubmissionStage('error');
        console.error('Submission failed:', result.error);
      }
    } catch (error) {
      // Handle unexpected error
      setSubmissionStage('error');
      console.error('Submission error:', error);
    }
  }, [globalState, chartRef]);

  return (
    <div className={styles.formContainer}>
      <SubmissionOverlay
        isVisible={showSubmissionOverlay}
        currentStage={submissionStage}
        progress={submissionProgress}
        details={submissionDetails}
        onClose={submissionStage === 'error' ? () => setShowSubmissionOverlay(false) : undefined}
      />
      <div className={`${styles.formContainer} ${styles.active}`}>
        <div className={styles.formContent}>
          {/* Status & Referrals Section */}
          <div className={styles.combinedSection}>
            <div className={styles.sectionHeader}>
              <ClipboardList className={styles.sectionIcon} size={18} />
              <h3>Status & Referrals</h3>
            </div>
            
            <div className={styles.statusGroup}>
              <div className={styles.formGroup}>
                <label>ASC Status</label>
                <select 
                  className={`${styles.statusDropdown} ${
                    formData.ascStatus === 'Confirmed' ? styles.confirmed : ''
                  }`}
                  value={formData.ascStatus || ''}
                  onChange={(e) => updateFormData({ ascStatus: e.target.value })}
                >
                  <option value="">--</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Suspected">Suspected</option>
                  <option value="Ruled Out">Ruled Out</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>ADHD Status</label>
                <select 
                  value={formData.adhdStatus} 
                  onChange={handleInputChange('adhdStatus')}
                >
                  <option value="">--</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="suspected">Suspected</option>
                  <option value="ruled-out">Ruled Out</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Differential Considerations</label>
                <input
                  type="text"
                  className={styles.differentialInput}
                  placeholder="Note any differential diagnostic considerations..."
                  value={formData.differentialDiagnosis || ''}
                  onChange={handleInputChange('differentialDiagnosis')}
                />
              </div>
            </div>

            <div className={styles.referralsSection}>
              <div className={styles.sectionHeader}>
                <Users className={styles.sectionIcon} size={18} />
                <h3>Referrals</h3>
              </div>
              <div className={styles.referralsGrid}>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="speech"
                    checked={formData.referrals.speech}
                    onChange={handleCheckboxChange('speech')}
                  />
                  <label htmlFor="speech">Speech & Language</label>
                </div>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="educational"
                    checked={formData.referrals.educational}
                    onChange={handleCheckboxChange('educational')}
                  />
                  <label htmlFor="educational">Educational Psychology</label>
                </div>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="sleep"
                    checked={formData.referrals.sleep}
                    onChange={handleCheckboxChange('sleep')}
                  />
                  <label htmlFor="sleep">Sleep Support</label>
                </div>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="occupational"
                    checked={formData.referrals.occupational}
                    onChange={handleCheckboxChange('occupational')}
                  />
                  <label htmlFor="occupational">Occupational Therapy</label>
                </div>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="mental"
                    checked={formData.referrals.mental}
                    onChange={handleCheckboxChange('mental')}
                  />
                  <label htmlFor="mental">Mental Health</label>
                </div>
                <div className={styles.referralCheckbox}>
                  <input
                    type="checkbox"
                    id="other"
                    checked={formData.referrals.other}
                    onChange={handleCheckboxChange('other')}
                  />
                  <label htmlFor="other">Other</label>
                </div>
              </div>
              <div className={styles.remarksRow}>
                <input
                  type="text"
                  className={styles.remarksInput}
                  placeholder="Additional notes or remarks..."
                  value={formData.remarks}
                  onChange={handleInputChange('remarks')}
                />
              </div>
            </div>
          </div>

          {/* Text Areas Grid */}
          <div className={styles.textAreasGrid}>
            <div className={styles.gridColumn}>
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <Search className={styles.sectionIcon} size={18} />
                  <h3>Clinical Observations</h3>
                  <div className={styles.tooltipContainer}>
                    <HelpCircle className={styles.helpIcon} size={16} />
                    <div className={styles.tooltip}>
                      <ul>
                        <li>Social engagement patterns</li>
                        <li>Communication style</li>
                        <li>Response to activities</li>
                        <li>Behavioral patterns</li>
                        <li>Notable strengths/challenges</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TextAreaWithOverlay
                  value={formData.clinicalObservations}
                  name="clinicalObservations"
                  placeholder="• Social engagement patterns
• Communication style
• Response to activities
• Behavioral patterns
• Notable strengths/challenges"
                  onChange={handleInputChange('clinicalObservations')}
                  onFocus={handleTextAreaFocus('clinicalObservations')}
                  onBlur={handleTextAreaBlur}
                  onKeyDown={handleTextAreaKeyDown}
                  onDoubleClick={() => handleSectionDoubleClick(
                    'clinicalObservations',
                    formData.clinicalObservations
                  )}
                />
                <div className={`${styles.wordCount} ${styles[getWordCountState(formData.clinicalObservations)]}`}>
                  {getWordCountText(formData.clinicalObservations)}
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <AlertTriangle className={styles.sectionIcon} size={18} />
                  <h3>Priority Support Areas</h3>
                  <div className={styles.tooltipContainer}>
                    <HelpCircle className={styles.helpIcon} size={16} />
                    <div className={styles.tooltip}>
                      <ul>
                        <li>Assessment data patterns</li>
                        <li>Family priorities</li>
                        <li>School observations</li>
                        <li>Clinical observations</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TextAreaWithOverlay
                  value={formData.priorityAreas}
                  name="priorityAreas"
                  placeholder="• Assessment data patterns
• Family priorities
• School observations
• Clinical observations"
                  onChange={handleInputChange('priorityAreas')}
                  onFocus={handleTextAreaFocus('priorityAreas')}
                  onBlur={handleTextAreaBlur}
                  onKeyDown={handleTextAreaKeyDown}
                  onDoubleClick={() => handleSectionDoubleClick(
                    'priorityAreas',
                    formData.priorityAreas
                  )}
                />
                <div className={`${styles.wordCount} ${styles[getWordCountState(formData.priorityAreas)]}`}>
                  {getWordCountText(formData.priorityAreas)}
                </div>
              </div>
            </div>
            <div className={styles.gridColumn}>
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <Dumbbell className={styles.sectionIcon} size={18} />
                  <h3>Strengths & Abilities</h3>
                  <div className={styles.tooltipContainer}>
                    <HelpCircle className={styles.helpIcon} size={16} />
                    <div className={styles.tooltip}>
                      <ul>
                        <li>Memory (e.g., Strong recall of sequences)</li>
                        <li>Visual (e.g., Pattern recognition)</li>
                        <li>Physical (e.g., Fine motor skills)</li>
                        <li>Social (e.g., Empathy, sharing)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TextAreaWithOverlay
                  value={formData.strengths}
                  name="strengths"
                  placeholder="• Memory (e.g., Strong recall of sequences)
• Visual (e.g., Pattern recognition)
• Physical (e.g., Fine motor skills)
• Social (e.g., Empathy, sharing)"
                  onChange={handleInputChange('strengths')}
                  onFocus={handleTextAreaFocus('strengths')}
                  onBlur={handleTextAreaBlur}
                  onKeyDown={handleTextAreaKeyDown}
                  onDoubleClick={() => handleSectionDoubleClick(
                    'strengths',
                    formData.strengths
                  )}
                />
                <div className={`${styles.wordCount} ${styles[getWordCountState(formData.strengths)]}`}>
                  {getWordCountText(formData.strengths)}
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <ThumbsUp className={styles.sectionIcon} size={18} />
                  <h3>Support Recommendations</h3>
                  <div className={styles.tooltipContainer}>
                    <HelpCircle className={styles.helpIcon} size={16} />
                    <div className={styles.tooltip}>
                      <ul>
                        <li>Strength-based strategies</li>
                        <li>Practical implementation</li>
                        <li>Home/school alignment</li>
                        <li>Support services coordination</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <TextAreaWithOverlay
                  value={formData.recommendations}
                  name="recommendations"
                  placeholder="• Strength-based strategies
• Practical implementation
• Home/school alignment
• Support services coordination"
                  onChange={handleInputChange('recommendations')}
                  onFocus={handleTextAreaFocus('recommendations')}
                  onBlur={handleTextAreaBlur}
                  onKeyDown={handleTextAreaKeyDown}
                  onDoubleClick={() => handleSectionDoubleClick(
                    'recommendations',
                    formData.recommendations
                  )}
                />
                <div className={`${styles.wordCount} ${styles[getWordCountState(formData.recommendations)]}`}>
                  {getWordCountText(formData.recommendations)}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.clearButton} onClick={handleClear}>
              Clear Form
            </button>
            <button 
              className={styles.submitButton} 
              onClick={() => handleStatusChange('submitted')}
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{modalContent.title}</h2>
              <button className={styles.closeButton} onClick={handleModalClose}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <textarea
                className={styles.modalTextArea}
                value={modalContent.content}
                onChange={handleModalContentChange}
                onKeyDown={handleModalKeyDown}
                placeholder={getTooltipContent(modalContent.title)}
                autoFocus
              />
              <div className={`${styles.wordCount} ${styles[getWordCountState(modalContent.content)]}`}>
                {getWordCountText(modalContent.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 