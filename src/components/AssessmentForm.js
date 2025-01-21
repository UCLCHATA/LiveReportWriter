import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useFormState } from '../hooks/useFormState';
import { SubmissionOverlay } from './SubmissionOverlay';
import styles from './AssessmentForm.module.css';
import { ClipboardList, Users, Search, AlertTriangle, Dumbbell, ThumbsUp, HelpCircle, X } from 'lucide-react';
import { SubmissionService } from '../services/submissionService';
const getWordCountState = (text) => {
    const wordCount = text?.trim().split(/\s+/).filter(Boolean).length || 0;
    if (wordCount < 60)
        return 'insufficient';
    if (wordCount < 120)
        return 'minimal';
    if (wordCount < 180)
        return 'good';
    return 'excellent';
};
const getWordCountText = (text) => {
    const wordCount = text?.trim().split(/\s+/).filter(Boolean).length || 0;
    if (wordCount < 60)
        return 'More detail needed';
    if (wordCount < 120)
        return 'Share a bit more';
    if (wordCount < 180)
        return 'Good detail';
    return 'Excellent detail';
};
const getTooltipContent = (section) => {
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
const TextAreaWithOverlay = ({ value, name, placeholder, onChange, onFocus, onBlur, onKeyDown, onDoubleClick }) => {
    const isExcellent = getWordCountState(value) === 'excellent';
    return (_jsxs("div", { className: styles.textAreaWrapper, children: [_jsx("textarea", { className: styles.textArea, name: name, placeholder: placeholder, value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur, onKeyDown: onKeyDown, onDoubleClick: onDoubleClick }), isExcellent && _jsx("div", { className: styles.textAreaOverlay })] }));
};
const getStageMessage = (stage) => {
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
export const AssessmentForm = ({ onClear, onProgressUpdate, initialProgress = 0 }) => {
    const { globalState, updateFormData, clearState } = useFormState();
    const [wordCounts, setWordCounts] = useState({});
    const lastProgress = useRef(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
    const [submissionStage, setSubmissionStage] = useState('submission');
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [submissionDetails, setSubmissionDetails] = useState();
    // Add modal state
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        content: '',
        field: ''
    });
    const chartRef = useRef(null);
    // Initialize with saved progress
    useEffect(() => {
        if (!isInitialized && initialProgress > 0) {
            lastProgress.current = initialProgress;
            setIsInitialized(true);
        }
    }, [isInitialized, initialProgress]);
    // Calculate progress whenever form fields change
    useEffect(() => {
        if (!globalState?.formData)
            return;
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
    const handleComponentComplete = useCallback((componentId, isComplete) => {
        if (!globalState?.formData?.componentProgress)
            return;
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
    const handleComponentProgressUpdate = useCallback((componentId, progress) => {
        if (!globalState?.formData?.componentProgress)
            return;
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
        }
        else {
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
        return _jsx("div", { children: "Loading..." });
    }
    const formData = globalState.formData;
    const handleInputChange = (field) => (e) => {
        const value = e.target.value;
        updateFormData({
            [field]: value
        });
    };
    const handleCheckboxChange = (field) => (e) => {
        const updatedReferrals = {
            ...formData.referrals,
            [field]: e.target.checked
        };
        updateFormData({
            referrals: updatedReferrals
        });
    };
    const handleStatusChange = async (newStatus) => {
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
                const result = await SubmissionService.submit(globalState, true, chartRef.current);
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
            }
            catch (error) {
                console.error('Form submission error:', error);
                setSubmissionStage('error');
            }
        }
        else {
            updateFormData({ status: newStatus });
        }
    };
    const handleClear = () => {
        clearState();
        onClear();
    };
    const [focusedTextArea, setFocusedTextArea] = useState(null);
    const handleTextAreaFocus = (field) => () => {
        setFocusedTextArea(field);
    };
    const handleTextAreaBlur = () => {
        setFocusedTextArea(null);
    };
    const handleTextAreaKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target;
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
            }
            else {
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
    const handleSectionDoubleClick = (field, content) => {
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
    const handleModalContentChange = (e) => {
        updateFormData({
            [modalContent.field]: e.target.value
        });
        setModalContent(prev => ({
            ...prev,
            content: e.target.value
        }));
    };
    const handleModalKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target;
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
        if (!globalState)
            return;
        try {
            const result = await SubmissionService.submit(globalState, true, chartRef.current);
            if (result.success) {
                // Handle successful submission
                setSubmissionStage('complete');
            }
            else {
                // Handle submission error
                setSubmissionStage('error');
                console.error('Submission failed:', result.error);
            }
        }
        catch (error) {
            // Handle unexpected error
            setSubmissionStage('error');
            console.error('Submission error:', error);
        }
    }, [globalState, chartRef]);
    return (_jsxs("div", { className: styles.formContainer, children: [_jsx(SubmissionOverlay, { isVisible: showSubmissionOverlay, currentStage: submissionStage, progress: submissionProgress, details: submissionDetails, onClose: submissionStage === 'error' ? () => setShowSubmissionOverlay(false) : undefined }), _jsx("div", { className: `${styles.formContainer} ${styles.active}`, children: _jsxs("div", { className: styles.formContent, children: [_jsxs("div", { className: styles.combinedSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(ClipboardList, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Status & Referrals" })] }), _jsxs("div", { className: styles.statusGroup, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "ASC Status" }), _jsxs("select", { className: `${styles.statusDropdown} ${formData.ascStatus === 'Confirmed' ? styles.confirmed : ''}`, value: formData.ascStatus || '', onChange: (e) => updateFormData({ ascStatus: e.target.value }), children: [_jsx("option", { value: "", children: "--" }), _jsx("option", { value: "Confirmed", children: "Confirmed" }), _jsx("option", { value: "Suspected", children: "Suspected" }), _jsx("option", { value: "Ruled Out", children: "Ruled Out" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "ADHD Status" }), _jsxs("select", { value: formData.adhdStatus, onChange: handleInputChange('adhdStatus'), children: [_jsx("option", { value: "", children: "--" }), _jsx("option", { value: "confirmed", children: "Confirmed" }), _jsx("option", { value: "suspected", children: "Suspected" }), _jsx("option", { value: "ruled-out", children: "Ruled Out" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { children: "Differential Considerations" }), _jsx("input", { type: "text", className: styles.differentialInput, placeholder: "Note any differential diagnostic considerations...", value: formData.differentialDiagnosis || '', onChange: handleInputChange('differentialDiagnosis') })] })] }), _jsxs("div", { className: styles.referralsSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(Users, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Referrals" })] }), _jsxs("div", { className: styles.referralsGrid, children: [_jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "speech", checked: formData.referrals.speech, onChange: handleCheckboxChange('speech') }), _jsx("label", { htmlFor: "speech", children: "Speech & Language" })] }), _jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "educational", checked: formData.referrals.educational, onChange: handleCheckboxChange('educational') }), _jsx("label", { htmlFor: "educational", children: "Educational Psychology" })] }), _jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "sleep", checked: formData.referrals.sleep, onChange: handleCheckboxChange('sleep') }), _jsx("label", { htmlFor: "sleep", children: "Sleep Support" })] }), _jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "occupational", checked: formData.referrals.occupational, onChange: handleCheckboxChange('occupational') }), _jsx("label", { htmlFor: "occupational", children: "Occupational Therapy" })] }), _jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "mental", checked: formData.referrals.mental, onChange: handleCheckboxChange('mental') }), _jsx("label", { htmlFor: "mental", children: "Mental Health" })] }), _jsxs("div", { className: styles.referralCheckbox, children: [_jsx("input", { type: "checkbox", id: "other", checked: formData.referrals.other, onChange: handleCheckboxChange('other') }), _jsx("label", { htmlFor: "other", children: "Other" })] })] }), _jsx("div", { className: styles.remarksRow, children: _jsx("input", { type: "text", className: styles.remarksInput, placeholder: "Additional notes or remarks...", value: formData.remarks, onChange: handleInputChange('remarks') }) })] })] }), _jsxs("div", { className: styles.textAreasGrid, children: [_jsxs("div", { className: styles.gridColumn, children: [_jsxs("div", { className: styles.formSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(Search, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Clinical Observations" }), _jsxs("div", { className: styles.tooltipContainer, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 16 }), _jsx("div", { className: styles.tooltip, children: _jsxs("ul", { children: [_jsx("li", { children: "Social engagement patterns" }), _jsx("li", { children: "Communication style" }), _jsx("li", { children: "Response to activities" }), _jsx("li", { children: "Behavioral patterns" }), _jsx("li", { children: "Notable strengths/challenges" })] }) })] })] }), _jsx(TextAreaWithOverlay, { value: formData.clinicalObservations, name: "clinicalObservations", placeholder: "\u2022 Social engagement patterns\n\u2022 Communication style\n\u2022 Response to activities\n\u2022 Behavioral patterns\n\u2022 Notable strengths/challenges", onChange: handleInputChange('clinicalObservations'), onFocus: handleTextAreaFocus('clinicalObservations'), onBlur: handleTextAreaBlur, onKeyDown: handleTextAreaKeyDown, onDoubleClick: () => handleSectionDoubleClick('clinicalObservations', formData.clinicalObservations) }), _jsx("div", { className: `${styles.wordCount} ${styles[getWordCountState(formData.clinicalObservations)]}`, children: getWordCountText(formData.clinicalObservations) })] }), _jsxs("div", { className: styles.formSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(AlertTriangle, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Priority Support Areas" }), _jsxs("div", { className: styles.tooltipContainer, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 16 }), _jsx("div", { className: styles.tooltip, children: _jsxs("ul", { children: [_jsx("li", { children: "Assessment data patterns" }), _jsx("li", { children: "Family priorities" }), _jsx("li", { children: "School observations" }), _jsx("li", { children: "Clinical observations" })] }) })] })] }), _jsx(TextAreaWithOverlay, { value: formData.priorityAreas, name: "priorityAreas", placeholder: "\u2022 Assessment data patterns\n\u2022 Family priorities\n\u2022 School observations\n\u2022 Clinical observations", onChange: handleInputChange('priorityAreas'), onFocus: handleTextAreaFocus('priorityAreas'), onBlur: handleTextAreaBlur, onKeyDown: handleTextAreaKeyDown, onDoubleClick: () => handleSectionDoubleClick('priorityAreas', formData.priorityAreas) }), _jsx("div", { className: `${styles.wordCount} ${styles[getWordCountState(formData.priorityAreas)]}`, children: getWordCountText(formData.priorityAreas) })] })] }), _jsxs("div", { className: styles.gridColumn, children: [_jsxs("div", { className: styles.formSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(Dumbbell, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Strengths & Abilities" }), _jsxs("div", { className: styles.tooltipContainer, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 16 }), _jsx("div", { className: styles.tooltip, children: _jsxs("ul", { children: [_jsx("li", { children: "Memory (e.g., Strong recall of sequences)" }), _jsx("li", { children: "Visual (e.g., Pattern recognition)" }), _jsx("li", { children: "Physical (e.g., Fine motor skills)" }), _jsx("li", { children: "Social (e.g., Empathy, sharing)" })] }) })] })] }), _jsx(TextAreaWithOverlay, { value: formData.strengths, name: "strengths", placeholder: "\u2022 Memory (e.g., Strong recall of sequences)\n\u2022 Visual (e.g., Pattern recognition)\n\u2022 Physical (e.g., Fine motor skills)\n\u2022 Social (e.g., Empathy, sharing)", onChange: handleInputChange('strengths'), onFocus: handleTextAreaFocus('strengths'), onBlur: handleTextAreaBlur, onKeyDown: handleTextAreaKeyDown, onDoubleClick: () => handleSectionDoubleClick('strengths', formData.strengths) }), _jsx("div", { className: `${styles.wordCount} ${styles[getWordCountState(formData.strengths)]}`, children: getWordCountText(formData.strengths) })] }), _jsxs("div", { className: styles.formSection, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx(ThumbsUp, { className: styles.sectionIcon, size: 18 }), _jsx("h3", { children: "Support Recommendations" }), _jsxs("div", { className: styles.tooltipContainer, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 16 }), _jsx("div", { className: styles.tooltip, children: _jsxs("ul", { children: [_jsx("li", { children: "Strength-based strategies" }), _jsx("li", { children: "Practical implementation" }), _jsx("li", { children: "Home/school alignment" }), _jsx("li", { children: "Support services coordination" })] }) })] })] }), _jsx(TextAreaWithOverlay, { value: formData.recommendations, name: "recommendations", placeholder: "\u2022 Strength-based strategies\n\u2022 Practical implementation\n\u2022 Home/school alignment\n\u2022 Support services coordination", onChange: handleInputChange('recommendations'), onFocus: handleTextAreaFocus('recommendations'), onBlur: handleTextAreaBlur, onKeyDown: handleTextAreaKeyDown, onDoubleClick: () => handleSectionDoubleClick('recommendations', formData.recommendations) }), _jsx("div", { className: `${styles.wordCount} ${styles[getWordCountState(formData.recommendations)]}`, children: getWordCountText(formData.recommendations) })] })] })] }), _jsxs("div", { className: styles.buttonGroup, children: [_jsx("button", { className: styles.clearButton, onClick: handleClear, children: "Clear Form" }), _jsx("button", { className: styles.submitButton, onClick: () => handleStatusChange('submitted'), children: "Submit Assessment" })] })] }) }), showModal && (_jsx("div", { className: styles.modal, children: _jsxs("div", { className: styles.modalContent, children: [_jsxs("div", { className: styles.modalHeader, children: [_jsx("h2", { children: modalContent.title }), _jsx("button", { className: styles.closeButton, onClick: handleModalClose, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: styles.modalBody, children: [_jsx("textarea", { className: styles.modalTextArea, value: modalContent.content, onChange: handleModalContentChange, onKeyDown: handleModalKeyDown, placeholder: getTooltipContent(modalContent.title), autoFocus: true }), _jsx("div", { className: `${styles.wordCount} ${styles[getWordCountState(modalContent.content)]}`, children: getWordCountText(modalContent.content) })] })] }) }))] }));
};
