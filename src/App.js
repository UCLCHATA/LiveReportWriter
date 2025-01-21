import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { useFormState } from './hooks/useFormState';
import './styles/main.css';
export const App = () => {
    const [progress, setProgress] = useState(0);
    const [componentProgress, setComponentProgress] = useState(0);
    const [formProgress, setFormProgress] = useState(0);
    const [isChataIdDialogOpen, setIsChataIdDialogOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { globalState, clearState, setClinicianInfo } = useFormState();
    // Handle global state changes
    useEffect(() => {
        if (globalState?.status === 'draft' && globalState?.chataId) {
            // Only initialize progress if we're in form input stage
            if (progress === 0) {
                setProgress(globalState.formData.formProgress || 0);
            }
        }
        else {
            // Reset UI state when not in form input stage
            setProgress(0);
            setComponentProgress(0);
            setFormProgress(0);
            setIsChataIdDialogOpen(false);
        }
    }, [globalState, progress]);
    // Combine progress from both components
    useEffect(() => {
        const totalProgress = Math.min(100, componentProgress + formProgress);
        // Check for milestones
        const previousProgress = progress;
        const milestones = [25, 50, 75, 100];
        const crossedMilestone = milestones.find(milestone => previousProgress < milestone && totalProgress >= milestone);
        if (crossedMilestone) {
            // Trigger milestone animation
            const confetti = document.createElement('script');
            confetti.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
            confetti.onload = () => {
                window.confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            };
            document.head.appendChild(confetti);
            document.head.removeChild(confetti);
        }
        setProgress(totalProgress);
    }, [componentProgress, formProgress, progress]);
    const handleComponentProgressUpdate = useCallback((newProgress) => {
        setComponentProgress(newProgress);
    }, []);
    const handleFormProgressUpdate = useCallback((newProgress) => {
        setFormProgress(newProgress);
    }, []);
    const handleClearForm = useCallback(() => {
        // First reset UI state
        setProgress(0);
        setComponentProgress(0);
        setFormProgress(0);
        setShowModal(false);
        setIsChataIdDialogOpen(false);
        // Then clear global state and storage
        clearState();
        // Force URL update
        const url = new URL(window.location.href);
        url.searchParams.delete('chataId');
        window.history.replaceState({}, '', url.toString());
    }, [clearState]);
    const handleCreateReport = useCallback(() => {
        setShowModal(true);
    }, []);
    const handleClinicianSubmit = useCallback((info) => {
        console.log('Submitting clinician info:', info);
        // Set clinician info first
        setClinicianInfo(info);
        // Close modal after state is updated
        setShowModal(false);
        // Show CHATA ID dialog only when transitioning to form input stage
        if (info.chataId) {
            setIsChataIdDialogOpen(true);
        }
    }, [setClinicianInfo]);
    // Determine current stage and what to show
    const isFormInputStage = globalState?.status === 'draft' && globalState?.chataId && globalState?.clinician?.name;
    const isClinicianModalStage = showModal;
    const isLoadUpStage = !isFormInputStage && !isClinicianModalStage;
    return (_jsxs("div", { className: "app", children: [_jsx(Header, { chataId: isFormInputStage ? globalState.chataId : '', progress: progress, isChataIdDialogOpen: isChataIdDialogOpen }), isFormInputStage ? (_jsxs("main", { children: [_jsx(AssessmentCarousel, { onProgressUpdate: handleComponentProgressUpdate, initialProgress: componentProgress }), _jsx(AssessmentForm, { onClear: handleClearForm, onProgressUpdate: handleFormProgressUpdate, initialProgress: formProgress })] })) : (_jsx(LandingPage, { onCreateReport: handleCreateReport })), _jsx(ClinicianModal, { isOpen: showModal, onSubmit: handleClinicianSubmit, onCancel: () => setShowModal(false) }), _jsx(Footer, {})] }));
};
