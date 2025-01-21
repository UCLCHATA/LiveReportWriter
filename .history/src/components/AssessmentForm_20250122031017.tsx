import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFormState } from '../hooks/useFormState';
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
import html2canvas from 'html2canvas';
import { submitFormData } from '../services/api';
import { SubmissionOverlay } from './SubmissionOverlay';
import { APPS_SCRIPT_URL } from '../config/api';
import { makeAppsScriptCall } from '../utils/api';
import { submitFormData } from '../services/formSubmission';
import { Milestone } from '../types';
import { 
  AlertTriangle, 
  Dumbbell, 
  ThumbsUp
} from 'lucide-react';
import type { Stage } from './SubmissionOverlay';
import type { GlobalFormState } from '../types';
import { SubmissionService } from '../services/submissionService';
import { ValidationDialog } from './ValidationDialog';

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

interface WordCountState {
  count: number;
  status: 'under' | 'good' | 'over';
}

interface TextAreaValidation {
  wordCount: number;
  status: 'insufficient' | 'minimal' | 'good' | 'excellent';
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

interface AssessmentFormProps {
  onClear: () => void;
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface ValidationItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Assessment {
  isComplete: boolean;
  [key: string]: any;
}

interface FormValidation {
  wordCount: number;
  status: 'insufficient' | 'minimal' | 'good' | 'excellent';
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
  onClear, 
  onProgressUpdate,
  initialProgress 
}) => {
  const { globalState, updateFormData } = useFormState();
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([]);
  const [submissionStage, setSubmissionStage] = useState<Stage>('initial');
  const [submissionProgress, setSubmissionProgress] = useState(0);

  const validateTextArea = (text: string): FormValidation => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    
    return {
      wordCount: count,
      status: count >= 100 ? 'excellent' 
           : count >= 75 ? 'good'
           : count >= 50 ? 'minimal'
           : 'insufficient'
    };
  };

  const checkComponentsCompletion = (): boolean => {
    if (!globalState?.assessments) return false;
    
    return Object.values(globalState.assessments as Record<string, Assessment>)
      .every((component) => component.isComplete === true);
  };

  const validateForm = (): boolean => {
    if (!globalState?.formData) return false;
    const formData = globalState.formData;

    const clinicalValidation = validateTextArea(formData.clinicalObservations || '');
    const strengthsValidation = validateTextArea(formData.strengths || '');
    const priorityValidation = validateTextArea(formData.priorityAreas || '');
    const recommendationsValidation = validateTextArea(formData.recommendations || '');
    
    const statusFieldsComplete = 
      formData.ascStatus !== '' && 
      formData.adhdStatus !== '';

    const allComponentsComplete = checkComponentsCompletion();

    const items: ValidationItem[] = [
      {
        id: 'clinical',
        label: 'Clinical Observations (minimum 75 words)',
        completed: clinicalValidation.status === 'good' || clinicalValidation.status === 'excellent'
      },
      {
        id: 'strengths',
        label: 'Strengths & Abilities (minimum 75 words)',
        completed: strengthsValidation.status === 'good' || strengthsValidation.status === 'excellent'
      },
      {
        id: 'priority',
        label: 'Priority Support Areas (minimum 75 words)',
        completed: priorityValidation.status === 'good' || priorityValidation.status === 'excellent'
      },
      {
        id: 'recommendations',
        label: 'Support Recommendations (minimum 75 words)',
        completed: recommendationsValidation.status === 'good' || recommendationsValidation.status === 'excellent'
      },
      {
        id: 'status',
        label: 'ASC and ADHD Status selected',
        completed: statusFieldsComplete
      },
      {
        id: 'components',
        label: 'All assessment components completed',
        completed: allComponentsComplete
      }
    ];

    setValidationItems(items);
    return items.every(item => item.completed);
  };

  const handleSubmit = async () => {
    if (!globalState) return;
    
    try {
      setSubmissionStage('submission');
      setSubmissionProgress(0);

      const result = await SubmissionService.submit(
        globalState, 
        true,
        null
      );

      if (result.success) {
        setSubmissionProgress(100);
        setSubmissionStage('complete');
        updateFormData({ 
          status: 'submitted',
          lastUpdated: new Date().toISOString()
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStage('error');
    }
  };

  const handleSubmitClick = () => {
    const isValid = validateForm();
    if (!isValid) {
      setShowValidationDialog(true);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.buttonGroup}>
        <button 
          className={styles.clearButton} 
          onClick={onClear}
        >
              Clear Form
            </button>
            <button 
              className={styles.submitButton} 
              onClick={handleSubmitClick}
            >
              Submit Assessment
            </button>
          </div>

      <ValidationDialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        onContinue={() => {
          setShowValidationDialog(false);
          handleSubmit();
        }}
        validationItems={validationItems}
      />

      {submissionStage !== 'initial' && (
        <SubmissionOverlay
          stage={submissionStage}
          progress={submissionProgress}
          onClose={() => setSubmissionStage('initial')}
        />
      )}
    </div>
  );
}; 