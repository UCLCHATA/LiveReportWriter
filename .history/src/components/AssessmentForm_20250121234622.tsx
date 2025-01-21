import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFormState } from '../hooks/useFormState';
import html2canvas from 'html2canvas';
import { submitFormData } from '../services/api';
import { SubmissionOverlay } from './SubmissionOverlay';
import type { Stage } from './SubmissionOverlay';
import type { RuntimeFormState } from '../types/formState';
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

  // Get the include flag from the assessment summary
  const summaryData = globalState.assessments?.summary as AssessmentSummaryData;
  const includeInReport = summaryData?.includeInReport || false;

  // Initialize with saved progress
  useEffect(() => {
    if (!isInitialized && initialProgress > 0) {
      lastProgress.current = initialProgress;
      setIsInitialized(true);
    }
  }, [isInitialized, initialProgress]);

  // Calculate progress whenever form fields change
  useEffect(() => {
    if (!globalState) return;

    const calculateProgress = () => {
      let progress = 0;
      
      // Component progress (50% total - 10% each for first 5)
      const componentProgress = Object.entries(globalState.formData?.componentProgress || {})
        .slice(0, 5)  // Only first 5 components
        .reduce((total, [_, data]) => {
          return total + (data.isComplete ? 10 : (data.progress * 0.1));
        }, 0);
      
      progress += componentProgress;
      
      // Text boxes contribute 40% (10% each)
      const textFields = {
        clinicalObservations: globalState.formData?.clinicalObservations,
        strengthsAbilities: globalState.formData?.strengths,
        prioritySupportAreas: globalState.formData?.priorityAreas,
        supportRecommendations: globalState.formData?.recommendations
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
      if (globalState.formData?.ascStatus && globalState.formData.ascStatus !== '') {
        progress += 2.5;
      }
      if (globalState.formData?.adhdStatus && globalState.formData.adhdStatus !== '') {
        progress += 2.5;
      }

      // Professional referrals contribute 5%
      const hasReferrals = Object.values(globalState.formData?.referrals || {}).some(value => value === true);
      if (hasReferrals) {
        progress += 5;
      }

      return Math.min(100, progress); // Ensure progress doesn't exceed 100%
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
    globalState?.formData?.componentProgress,
    onProgressUpdate,
    updateFormData
  ]);

  // Add handlers for component progress
  const handleComponentComplete = useCallback((componentId: string, isComplete: boolean) => {
    if (!globalState) return;
    const currentProgress = globalState.formData?.componentProgress?.[componentId]?.progress ?? 0;
    updateFormData({
      componentProgress: {
        ...globalState.formData?.componentProgress,
        [componentId]: {
          progress: currentProgress,
          isComplete
        }
      }
    });
  }, [globalState, updateFormData]);

  const handleComponentProgressUpdate = useCallback((componentId: string, progress: number) => {
    if (!globalState) return;
    const currentIsComplete = globalState.formData?.componentProgress?.[componentId]?.isComplete ?? false;
    updateFormData({
      componentProgress: {
        ...globalState.formData?.componentProgress,
        [componentId]: {
          progress,
          isComplete: currentIsComplete
        }
      }
    });
  }, [globalState, updateFormData]);

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
      try {
        setSubmissionStage('submission');
        setSubmissionProgress(0);

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
          includeInReport,
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

      } catch (error) {
        console.error('Form submission error:', error);
        setSubmissionStage('error');
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