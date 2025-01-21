import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Activity, 
  Users, 
  Star, 
  Lightbulb,
  MessageSquare,
  Zap,
  Award,
  Brain,
  Sparkles,
  Target,
  Search,
  AlertTriangle,
  Dumbbell,
  ThumbsUp,
  HelpCircle
} from 'lucide-react';
import styles from './AssessmentForm.module.css';

interface WordCountState {
  count: number;
  status: 'under' | 'good' | 'over';
}

interface AssessmentFormProps {
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  onProgressUpdate: (progress: number) => void;
  progress: number;
  formState?: any;
  onStateChange: (state: any) => void;
  onSubmit: () => void;
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

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  clinicianInfo,
  onProgressUpdate,
  progress,
  formState,
  onStateChange,
  onSubmit
}) => {
  const [wordCounts, setWordCounts] = useState<Record<string, WordCountState>>({});
  const [focusedTextArea, setFocusedTextArea] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{
    field: string;
    value: string;
    placeholder: string;
    title: string;
  } | null>(null);
  const [localFormState, setLocalFormState] = useState(formState || {
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

  // Update local state when form state changes
  useEffect(() => {
    if (formState) {
      setLocalFormState(formState);
    }
  }, [formState]);

  // Calculate progress whenever form fields change
  useEffect(() => {
    const calculateProgress = () => {
      let progress = 0;
      
      // Text boxes contribute 40% (10% each)
      const textFields = {
        clinicalObservations: localFormState.clinicalObservations,
        strengthsAbilities: localFormState.strengths,
        prioritySupportAreas: localFormState.priorityAreas,
        supportRecommendations: localFormState.recommendations
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
      if (localFormState.ascStatus && localFormState.ascStatus !== '') {
        progress += 2.5;
      }
      if (localFormState.adhdStatus && localFormState.adhdStatus !== '') {
        progress += 2.5;
      }

      // Professional referrals contribute 5%
      const hasReferrals = Object.values(localFormState.referrals || {}).some(value => value === true);
      if (hasReferrals) {
        progress += 5;
      }

      return progress;
    };

    const newProgress = calculateProgress();
    onProgressUpdate(newProgress);
  }, [localFormState, onProgressUpdate]);

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    const updatedState = {
      ...localFormState,
      [field]: value,
      lastUpdated: new Date().toISOString()
    };
    setLocalFormState(updatedState);
    onStateChange(updatedState);
  };

  const handleCheckboxChange = (field: keyof typeof localFormState.referrals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedState = {
      ...localFormState,
      referrals: {
        ...localFormState.referrals,
        [field]: e.target.checked
      },
      lastUpdated: new Date().toISOString()
    };
    setLocalFormState(updatedState);
    onStateChange(updatedState);
  };

  const handleTextAreaFocus = (field: string) => () => {
    setFocusedTextArea(field);
  };

  const handleTextAreaBlur = () => {
    setFocusedTextArea(null);
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      const updatedState = {
        ...localFormState,
        [textarea.name]: newValue,
        lastUpdated: new Date().toISOString()
      };
      setLocalFormState(updatedState);
      onStateChange(updatedState);
      
      // Set cursor position after the inserted tabs
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const handleSectionDoubleClick = (field: string, value: string, placeholder: string, title: string) => {
    setModalContent({
      field,
      value,
      placeholder,
      title
    });
  };

  const handleModalClose = () => {
    setModalContent(null);
  };

  // ... keep existing render methods ...

  return (
    <div className={styles.container}>
      {/* ... keep existing JSX ... */}
    </div>
  );
}; 