import React, { useEffect, useState } from 'react';
import { useFormState } from '../hooks/useFormState';
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
  onClear: () => void;
  onProgressUpdate: (progress: number) => void;
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

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear, onProgressUpdate }) => {
  const { globalState, updateFormData, clearState } = useFormState();
  const [wordCounts, setWordCounts] = useState<Record<string, WordCountState>>({});

  // Calculate progress whenever form fields change
  useEffect(() => {
    let progress = 0;
    
    // Text boxes contribute 40% (10% each)
    const textFields = [
      globalState.formData?.clinicalObservations,
      globalState.formData?.strengthsAbilities,
      globalState.formData?.prioritySupportAreas,
      globalState.formData?.supportRecommendations
    ];
    
    textFields.forEach(field => {
      if (field && field.trim().length > 0) {
        progress += 10;
      }
    });

    // Status fields contribute 5% (2.5% each)
    if (globalState.formData?.ascStatus && globalState.formData.ascStatus !== 'Not Specified') progress += 2.5;
    if (globalState.formData?.adhdStatus && globalState.formData.adhdStatus !== 'Not Specified') progress += 2.5;

    // Professional referrals contribute 5%
    if (globalState.formData?.professionalReferrals && globalState.formData.professionalReferrals.length > 0) {
      progress += 5;
    }

    onProgressUpdate(progress);
  }, [globalState.formData, onProgressUpdate]);

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleStatusChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleReferralChange = (referrals: string[]) => {
    updateFormData({ professionalReferrals: referrals });
  };

  const handleClear = () => {
    clearState();
    onClear();
  };

  return (
    <div className={styles.formContainer}>
      {/* Rest of the component JSX */}
    </div>
  );
}; 