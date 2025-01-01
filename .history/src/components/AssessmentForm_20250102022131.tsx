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
      formData.clinicalObservations,
      formData.strengthsAbilities,
      formData.prioritySupportAreas,
      formData.supportRecommendations
    ];
    
    textFields.forEach(field => {
      if (field && field.trim().length > 0) {
        progress += 10;
      }
    });

    // Status fields contribute 5% (2.5% each)
    if (formData.ascStatus && formData.ascStatus !== 'Not Specified') progress += 2.5;
    if (formData.adhdStatus && formData.adhdStatus !== 'Not Specified') progress += 2.5;

    // Professional referrals contribute 5%
    if (formData.professionalReferrals && formData.professionalReferrals.length > 0) {
      progress += 5;
    }

    onProgressUpdate(progress);
  }, [formData, onProgressUpdate]);

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
        recommendations: ''
      });
    }
  }, []);

  if (!globalState.formData) {
    return <div>Loading...</div>;
  }

  const formData = globalState.formData;

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    updateFormData({ [field]: e.target.value });
  };

  const handleCheckboxChange = (field: keyof typeof formData.referrals) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateFormData({
      referrals: {
        ...formData.referrals,
        [field]: e.target.checked
      }
    });
  };

  const handleStatusChange = (newStatus: 'draft' | 'submitted') => {
    updateFormData({ status: newStatus });
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

  // Add new state for modal
  const [modalContent, setModalContent] = useState<{
    field: string;
    value: string;
    placeholder: string;
    title: string;
  } | null>(null);

  // Add double click handler to the entire form section
  const handleSectionDoubleClick = (field: string, value: string, placeholder: string, title: string) => {
    setModalContent({
      field,
      value,
      placeholder,
      title
    });
  };

  // Add modal close handler
  const handleModalClose = () => {
    setModalContent(null);
  };

  // Update modal render function
  const renderModal = () => {
    if (!modalContent) return null;

    const getSectionColor = () => {
      switch (modalContent.field) {
        case 'clinicalObservations': return '#6366f1';
        case 'priorityAreas': return '#10b981';
        case 'strengths': return '#f59e0b';
        case 'recommendations': return '#ec4899';
        default: return '#e5e7eb';
      }
    };

    const getSectionIcon = () => {
      switch (modalContent.field) {
        case 'clinicalObservations': return <Search size={18} />;
        case 'priorityAreas': return <AlertTriangle size={18} />;
        case 'strengths': return <Dumbbell size={18} />;
        case 'recommendations': return <ThumbsUp size={18} />;
        default: return null;
      }
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
        
        // Set cursor position after bullet point
        setTimeout(() => {
          target.selectionStart = cursorPosition + 3;
          target.selectionEnd = cursorPosition + 3;
        }, 0);
      }
    };

    return (
      <div className={styles.modalOverlay} onClick={handleModalClose}>
        <div 
          className={styles.modalContent} 
          onClick={e => e.stopPropagation()}
          style={{ 
            borderColor: getSectionColor(),
            backgroundColor: 'white'
          }}
        >
          <div className={styles.modalHeader}>
            {getSectionIcon()}
            <h3>{modalContent.title}</h3>
            <button className={styles.closeButton} onClick={handleModalClose}>
              ×
            </button>
          </div>
          <textarea
            className={styles.modalTextArea}
            value={formData[modalContent.field as keyof typeof formData] as string}
            onChange={(e) => updateFormData({ [modalContent.field]: e.target.value })}
            onKeyDown={handleModalKeyDown}
            placeholder={modalContent.placeholder}
            autoFocus
          />
          <div className={`${styles.wordCount} ${styles[getWordCountState(formData[modalContent.field as keyof typeof formData] as string)]}`}>
            {getWordCountText(formData[modalContent.field as keyof typeof formData] as string)}
          </div>
        </div>
      </div>
    );
  };

  return (
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
                value={formData.ascStatus} 
                onChange={handleInputChange('ascStatus')}
              >
                <option value="">--</option>
                <option value="confirmed">Confirmed</option>
                <option value="suspected">Suspected</option>
                <option value="ruled-out">Ruled Out</option>
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
              <textarea 
                className={styles.textArea}
                name="clinicalObservations"
                placeholder="• Social engagement patterns
• Communication style
• Response to activities
• Behavioral patterns
• Notable strengths/challenges"
                value={formData.clinicalObservations}
                onChange={handleInputChange('clinicalObservations')}
                onFocus={handleTextAreaFocus('clinicalObservations')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleSectionDoubleClick(
                  'clinicalObservations',
                  formData.clinicalObservations,
                  "• Social engagement patterns\n• Communication style\n• Response to activities\n• Behavioral patterns\n• Notable strengths/challenges",
                  "Clinical Observations"
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
              <textarea 
                className={styles.textArea}
                name="priorityAreas"
                placeholder="• Assessment data patterns
• Family priorities
• School observations
• Clinical observations"
                value={formData.priorityAreas}
                onChange={handleInputChange('priorityAreas')}
                onFocus={handleTextAreaFocus('priorityAreas')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleSectionDoubleClick(
                  'priorityAreas',
                  formData.priorityAreas,
                  "• Assessment data patterns\n• Family priorities\n• School observations\n• Clinical observations",
                  "Priority Support Areas"
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
              <textarea 
                className={styles.textArea}
                name="strengths"
                placeholder="• Memory (e.g., Strong recall of sequences)
• Visual (e.g., Pattern recognition)
• Physical (e.g., Fine motor skills)
• Social (e.g., Empathy, sharing)"
                value={formData.strengths}
                onChange={handleInputChange('strengths')}
                onFocus={handleTextAreaFocus('strengths')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleSectionDoubleClick(
                  'strengths',
                  formData.strengths,
                  "• Memory (e.g., Strong recall of sequences)\n• Visual (e.g., Pattern recognition)\n• Physical (e.g., Fine motor skills)\n• Social (e.g., Empathy, sharing)",
                  "Strengths & Abilities"
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
              <textarea 
                className={styles.textArea}
                name="recommendations"
                placeholder="• Strength-based strategies
• Practical implementation
• Home/school alignment
• Support services coordination"
                value={formData.recommendations}
                onChange={handleInputChange('recommendations')}
                onFocus={handleTextAreaFocus('recommendations')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleSectionDoubleClick(
                  'recommendations',
                  formData.recommendations,
                  "• Strength-based strategies\n• Practical implementation\n• Home/school alignment\n• Support services coordination",
                  "Support Recommendations"
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
      {renderModal()}
    </div>
  );
}; 