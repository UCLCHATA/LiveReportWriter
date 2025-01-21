import React, { useEffect, useMemo, useState } from 'react';
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

type AssessmentFormProps = {
  onClear: () => void;
};

const getTextLengthStatus = (text: string) => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) return { status: 'inadequate', message: 'More detail needed' };
  if (wordCount < 200) return { status: 'minimal', message: 'Getting there' };
  if (wordCount < 300) return { status: 'adequate', message: 'Good detail' };
  return { status: 'excellent', message: 'Excellent detail' };
};

const getTooltipContent = (section: string): string => {
  switch (section) {
    case 'Clinical Observations':
      return '• Social engagement patterns\n• Communication style\n• Response to activities\n• Behavioral patterns\n• Notable strengths/challenges';
    case 'Strengths & Abilities':
      return '• Memory and recall abilities\n• Visual processing skills\n• Physical capabilities\n• Social competencies\n• Special interests/talents';
    case 'Priority Support Areas':
      return '• Assessment data patterns\n• Family priorities\n• School observations\n• Clinical observations\n• Development needs';
    case 'Support Recommendations':
      return '• Strength-based strategies\n• Practical implementation steps\n• Home/school alignment\n• Support services coordination\n• Progress monitoring plan';
    case 'Status':
      return '• Current diagnostic status\n• Assessment findings\n• Clinical judgment\n• Differential considerations';
    case 'Referrals':
      return '• Specialist recommendations\n• Support services needed\n• Intervention priorities\n• Follow-up requirements';
    default:
      return '';
  }
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onClear }) => {
  const { globalState, updateFormData, clearState } = useFormState();

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

  // Add double click handler
  const handleDoubleClick = (field: string, value: string, placeholder: string, title: string) => {
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

  // Add modal content update handler
  const handleModalContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (modalContent) {
      updateFormData({ [modalContent.field]: e.target.value });
    }
  };

  // Add modal component
  const renderModal = () => {
    if (!modalContent) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={handleModalClose}>×</button>
          <div className={styles.sectionHeader}>
            <h3>{modalContent.title}</h3>
          </div>
          <textarea
            className={styles.textArea}
            value={modalContent.value}
            onChange={handleModalContentChange}
            placeholder={modalContent.placeholder}
            style={{ minHeight: '300px' }}
          />
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
                <HelpCircle className={styles.helpIcon} size={16} />
                <div className={styles.tooltip}>
                  • Social engagement patterns
                  • Communication style
                  • Response to activities
                  • Behavioral patterns
                  • Notable strengths/challenges
                </div>
              </div>
              <textarea 
                className={styles.textArea}
                name="clinicalObservations"
                placeholder="• Social engagement patterns&#10;• Communication style&#10;• Response to activities&#10;• Behavioral patterns&#10;• Notable strengths/challenges"
                value={formData.clinicalObservations}
                onChange={handleInputChange('clinicalObservations')}
                onFocus={handleTextAreaFocus('clinicalObservations')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleDoubleClick(
                  'clinicalObservations',
                  formData.clinicalObservations,
                  "• Social engagement patterns\n• Communication style\n• Response to activities\n• Behavioral patterns\n• Notable strengths/challenges",
                  "Clinical Observations"
                )}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.clinicalObservations).status]} ${focusedTextArea === 'clinicalObservations' ? styles.visible : ''}`}>
                {getTextLengthStatus(formData.clinicalObservations).message}
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <AlertTriangle className={styles.sectionIcon} size={18} />
                <h3>Priority Support Areas</h3>
                <HelpCircle className={styles.helpIcon} size={16} />
                <div className={styles.tooltip}>
                  • Assessment data patterns
                  • Family priorities
                  • School observations
                  • Clinical observations
                </div>
              </div>
              <textarea 
                className={styles.textArea}
                name="priorityAreas"
                placeholder="• Assessment data patterns&#10;• Family priorities&#10;• School observations&#10;• Clinical observations"
                value={formData.priorityAreas}
                onChange={handleInputChange('priorityAreas')}
                onFocus={handleTextAreaFocus('priorityAreas')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleDoubleClick(
                  'priorityAreas',
                  formData.priorityAreas,
                  "• Assessment data patterns\n• Family priorities\n• School observations\n• Clinical observations",
                  "Priority Support Areas"
                )}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.priorityAreas).status]} ${focusedTextArea === 'priorityAreas' ? styles.visible : ''}`}>
                {getTextLengthStatus(formData.priorityAreas).message}
              </div>
            </div>
          </div>
          <div className={styles.gridColumn}>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <Dumbbell className={styles.sectionIcon} size={18} />
                <h3>Strengths & Abilities</h3>
                <HelpCircle className={styles.helpIcon} size={16} />
                <div className={styles.tooltip}>
                  • Memory (e.g., Strong recall of sequences)
                  • Visual (e.g., Pattern recognition)
                  • Physical (e.g., Fine motor skills)
                  • Social (e.g., Empathy, sharing)
                </div>
              </div>
              <textarea 
                className={styles.textArea}
                name="strengths"
                placeholder="• Memory (e.g., Strong recall of sequences)&#10;• Visual (e.g., Pattern recognition)&#10;• Physical (e.g., Fine motor skills)&#10;• Social (e.g., Empathy, sharing)"
                value={formData.strengths}
                onChange={handleInputChange('strengths')}
                onFocus={handleTextAreaFocus('strengths')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleDoubleClick(
                  'strengths',
                  formData.strengths,
                  "• Memory (e.g., Strong recall of sequences)\n• Visual (e.g., Pattern recognition)\n• Physical (e.g., Fine motor skills)\n• Social (e.g., Empathy, sharing)",
                  "Strengths & Abilities"
                )}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.strengths).status]} ${focusedTextArea === 'strengths' ? styles.visible : ''}`}>
                {getTextLengthStatus(formData.strengths).message}
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <ThumbsUp className={styles.sectionIcon} size={18} />
                <h3>Support Recommendations</h3>
                <HelpCircle className={styles.helpIcon} size={16} />
                <div className={styles.tooltip}>
                  • Strength-based strategies
                  • Practical implementation
                  • Home/school alignment
                  • Support services coordination
                </div>
              </div>
              <textarea 
                className={styles.textArea}
                name="recommendations"
                placeholder="• Strength-based strategies&#10;• Practical implementation&#10;• Home/school alignment&#10;• Support services coordination"
                value={formData.recommendations}
                onChange={handleInputChange('recommendations')}
                onFocus={handleTextAreaFocus('recommendations')}
                onBlur={handleTextAreaBlur}
                onKeyDown={handleTextAreaKeyDown}
                onDoubleClick={() => handleDoubleClick(
                  'recommendations',
                  formData.recommendations,
                  "• Strength-based strategies\n• Practical implementation\n• Home/school alignment\n• Support services coordination",
                  "Support Recommendations"
                )}
              />
              <div className={`${styles.textLengthIndicator} ${styles[getTextLengthStatus(formData.recommendations).status]} ${focusedTextArea === 'recommendations' ? styles.visible : ''}`}>
                {getTextLengthStatus(formData.recommendations).message}
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