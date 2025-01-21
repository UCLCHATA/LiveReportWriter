import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId } from '../utils/chataId';
import { useFormState } from '../hooks/useFormState';
const generateAgeOptions = () => {
    const options = [];
    // Add 2-6 years with months
    for (let year = 2; year <= 6; year++) {
        for (let month = 0; month < 12; month++) {
            const totalMonths = year * 12 + month;
            if (totalMonths <= 71) { // Up to 5 years 11 months
                options.push({
                    value: totalMonths.toString(),
                    label: `${year} year${year > 1 ? 's' : ''}, ${month} month${month !== 1 ? 's' : ''} (${totalMonths} months)`
                });
            }
        }
    }
    // Add 6-13 years without months
    for (let year = 6; year <= 13; year++) {
        options.push({
            value: (year * 12).toString(),
            label: `${year} years`
        });
    }
    return options;
};
export const ClinicianModal = ({ isOpen, onSubmit, onCancel, onChataIdDialogChange }) => {
    const { globalState, setClinicianInfo: updateGlobalClinicianInfo } = useFormState();
    const [clinicianInfo, setClinicianInfo] = useState({
        name: '',
        email: '',
        clinicName: '',
        childFirstName: '',
        childLastName: '',
        childAge: '',
        childGender: '',
    });
    const [formattedInfo, setFormattedInfo] = useState(null);
    const [showChataIdInfo, setShowChataIdInfo] = useState(false);
    const [chataIdInput, setChataIdInput] = useState('');
    const [chataIdError, setChataIdError] = useState('');
    const [currentChataId, setCurrentChataId] = useState(null);
    const [showDraftAlert, setShowDraftAlert] = useState(false);
    const [showRetrievalOverlay, setShowRetrievalOverlay] = useState(false);
    const ageOptions = useMemo(() => generateAgeOptions(), []);
    const createNewForm = () => {
        if (!formattedInfo)
            return;
        // Generate new CHATA ID
        const newChataId = generateChataId(formattedInfo.name, formattedInfo.childFirstName);
        setCurrentChataId(newChataId);
        // Update global state with new clinician info
        updateGlobalClinicianInfo({
            ...formattedInfo,
            chataId: newChataId
        });
        onSubmit({
            ...formattedInfo,
            chataId: newChataId
        });
        setShowChataIdInfo(true);
        onChataIdDialogChange?.(true);
        setShowRetrievalOverlay(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Trim and validate required fields
        const trimmedName = clinicianInfo.name?.trim() || '';
        const trimmedEmail = clinicianInfo.email?.trim() || '';
        const trimmedClinicName = clinicianInfo.clinicName?.trim() || '';
        if (!trimmedName || !trimmedEmail || !trimmedClinicName) {
            // Show error to user that required fields are missing
            return;
        }
        const formatted = {
            name: trimmedName,
            email: trimmedEmail,
            clinicName: trimmedClinicName,
            childFirstName: clinicianInfo.childFirstName?.trim() || '',
            childLastName: clinicianInfo.childLastName?.trim() || '',
            childAge: clinicianInfo.childAge || '',
            childGender: clinicianInfo.childGender?.trim() || ''
        };
        // Check for existing form with same clinician/child combination
        const existingForm = globalState?.clinician.name === formatted.name &&
            globalState?.clinician.childFirstName === formatted.childFirstName;
        if (existingForm && formatted.childFirstName) {
            setChataIdInput(globalState.chataId);
            setShowRetrievalOverlay(true);
            return;
        }
        // Generate new CHATA ID
        const newChataId = generateChataId(formatted.name, formatted.childFirstName);
        // Update URL with new CHATA ID
        const url = new URL(window.location.href);
        url.searchParams.set('chataId', newChataId);
        window.history.replaceState({}, '', url.toString());
        // Update global state with new clinician info
        updateGlobalClinicianInfo({
            ...formatted,
            chataId: newChataId
        });
        onSubmit({
            ...formatted,
            chataId: newChataId
        });
        // Show CHATA ID info and update UI
        setCurrentChataId(newChataId);
        setShowChataIdInfo(true);
        onChataIdDialogChange?.(true);
        setShowRetrievalOverlay(false);
    };
    const handleStartNew = () => {
        setShowRetrievalOverlay(false);
        setChataIdError('');
        createNewForm();
    };
    const handleRetrieveClick = () => {
        // Check if we have clinician name
        if (!clinicianInfo.name) {
            setChataIdError('Please enter clinician name first');
            return;
        }
        // Try to restore form
        if (globalState && globalState.clinician.name === clinicianInfo.name) {
            try {
                const info = {
                    name: globalState.clinician.name,
                    email: globalState.clinician.email,
                    clinicName: globalState.clinician.clinicName,
                    childFirstName: globalState.clinician.childFirstName || '',
                    childLastName: globalState.clinician.childLastName || '',
                    childAge: globalState.clinician.childAge || '',
                    childGender: globalState.clinician.childGender || '',
                    chataId: globalState.chataId
                };
                setClinicianInfo(info);
                onSubmit(info);
                console.log('✅ Successfully restored form for clinician:', info.name);
            }
            catch (error) {
                console.error('Failed to restore form:', error);
                setChataIdError('Failed to restore form data');
            }
        }
        else {
            setChataIdError('No saved form found for this clinician and child');
        }
    };
    const handleRetrieveClose = () => {
        setShowRetrievalOverlay(false);
        setChataIdInput('');
        setChataIdError('');
    };
    const handleChataIdInfoClose = () => {
        setShowChataIdInfo(false);
        onChataIdDialogChange?.(false);
        onCancel(); // Close the modal after user acknowledges CHATA ID
    };
    // Update component mount logic to not show CHATA ID info on load
    useEffect(() => {
        // Reset state when modal opens
        if (isOpen) {
            setShowChataIdInfo(false);
            setChataIdInput('');
            setChataIdError('');
            setShowRetrievalOverlay(false);
            setCurrentChataId(null);
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.modalOverlay, children: _jsxs("div", { className: styles.modalContent, children: [_jsx("button", { className: styles.closeButton, onClick: onCancel, "aria-label": "Close", children: "\u00D7" }), _jsx("h2", { children: "Enter Assessment Details" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: styles.formSection, children: [_jsx("h3", { children: "Clinician Information" }), _jsxs("div", { className: styles.formRow, children: [_jsxs("div", { className: `${styles.formGroup} ${styles.compactField} ${styles.clinicField}`, children: [_jsx("label", { htmlFor: "clinician-name", children: "Clinician Name" }), _jsx("input", { id: "clinician-name", type: "text", value: clinicianInfo.name, onChange: (e) => setClinicianInfo((prev) => ({ ...prev, name: e.target.value })), required: true })] }), _jsxs("div", { className: `${styles.formGroup} ${styles.compactField} ${styles.emailField}`, children: [_jsx("label", { htmlFor: "clinician-email", children: "Clinician Email" }), _jsx("input", { id: "clinician-email", type: "email", value: clinicianInfo.email, onChange: (e) => setClinicianInfo((prev) => ({ ...prev, email: e.target.value })), required: true })] }), _jsxs("div", { className: `${styles.formGroup} ${styles.compactField} ${styles.clinicField}`, children: [_jsx("label", { htmlFor: "clinic-name", children: "Clinic Name" }), _jsx("input", { id: "clinic-name", type: "text", value: clinicianInfo.clinicName, onChange: (e) => setClinicianInfo((prev) => ({ ...prev, clinicName: e.target.value })), required: true })] })] })] }), _jsxs("div", { className: styles.formSection, children: [_jsx("h3", { children: "Child Information (Optional)" }), _jsx("p", { className: styles.gdprNotice, children: "Child's information is stored locally on your computer only and is not transmitted to our servers. This data is used solely for assessment purposes and will be automatically removed after 30 days of inactivity. You can delete this information at any time by clearing your browser data." }), _jsxs("div", { className: styles.formRow, children: [_jsxs("div", { className: `${styles.formGroup} ${styles.compactField}`, children: [_jsx("label", { htmlFor: "childFirstName", children: "Child's First Name" }), _jsx("input", { type: "text", id: "childFirstName", name: "childFirstName", value: clinicianInfo.childFirstName || '', onChange: (e) => setClinicianInfo((prev) => ({ ...prev, childFirstName: e.target.value })) })] }), _jsxs("div", { className: `${styles.formGroup} ${styles.compactField}`, children: [_jsx("label", { htmlFor: "childLastName", children: "Child's Last Name" }), _jsx("input", { type: "text", id: "childLastName", name: "childLastName", value: clinicianInfo.childLastName || '', onChange: (e) => setClinicianInfo((prev) => ({ ...prev, childLastName: e.target.value })) })] }), _jsxs("div", { className: `${styles.formGroup} ${styles.compactField} ${styles.ageField}`, children: [_jsx("label", { htmlFor: "child-age", children: "Child's Age" }), _jsx(Select, { inputId: "child-age", options: ageOptions, value: ageOptions.find(opt => opt.value === clinicianInfo.childAge), onChange: (selected) => setClinicianInfo((prev) => ({
                                                                ...prev,
                                                                childAge: selected?.value || ''
                                                            })), isSearchable: true, isClearable: true, placeholder: "Type or select age", className: styles.ageSelect, classNamePrefix: "age-select" })] }), _jsxs("div", { className: `${styles.formGroup} ${styles.compactField} ${styles.genderField}`, children: [_jsx("label", { htmlFor: "child-gender", children: "Child's Gender" }), _jsxs("select", { id: "child-gender", value: clinicianInfo.childGender, onChange: (e) => setClinicianInfo((prev) => ({ ...prev, childGender: e.target.value })), children: [_jsx("option", { value: "", children: "Select" }), _jsx("option", { value: "male", children: "Male" }), _jsx("option", { value: "female", children: "Female" }), _jsx("option", { value: "other", children: "Other" }), _jsx("option", { value: "prefer-not-to-say", children: "Prefer not to say" })] })] })] })] }), _jsxs("div", { className: styles.buttonGroup, children: [_jsx("button", { type: "button", className: styles.cancelButton, onClick: onCancel, children: "Cancel" }), _jsx("button", { type: "button", onClick: handleRetrieveClick, className: `${styles.submitButton} ${styles.retrieveButton}`, children: "Restore Form" }), _jsx("button", { type: "submit", className: styles.submitButton, children: "Start Assessment" })] })] })] }) }), showRetrievalOverlay && (_jsx("div", { className: styles.dialogOverlay, children: _jsxs("div", { className: styles.dialogContent, children: [_jsx("button", { className: styles.closeButton, onClick: handleRetrieveClose, "aria-label": "Close", children: "\u00D7" }), _jsx("h3", { children: "Restore Form" }), _jsx("p", { children: "A saved form was found for this clinician/child combination." }), _jsx("p", { children: "Would you like to restore it?" }), chataIdError && _jsx("div", { className: styles.error, children: chataIdError }), _jsxs("div", { className: styles.buttonGroup, children: [_jsx("button", { onClick: handleRetrieveClose, className: styles.cancelButton, children: "Cancel" }), _jsx("button", { onClick: handleRetrieveClick, className: styles.submitButton, children: "Restore Form" }), _jsx("button", { onClick: handleStartNew, className: `${styles.submitButton} ${styles.startNewButton}`, children: "Start New" })] })] }) })), showChataIdInfo && currentChataId && (_jsx("div", { className: styles.blurryOverlay, children: _jsxs("div", { className: styles.dialogContent, children: [_jsx("button", { className: styles.closeButton, onClick: handleChataIdInfoClose, "aria-label": "Close", children: "\u00D7" }), _jsx("h3", { children: "Important: Save Your CHATA ID" }), _jsx("p", { children: "Please write down your CHATA ID to retrieve your form later:" }), _jsx("div", { className: styles.chataIdDisplay, children: _jsx("span", { className: styles.blinkingId, children: currentChataId }) }), _jsxs("p", { className: styles.chataIdNote, children: ["Your CHATA ID is your key to access this form later.", _jsx("br", {}), "Keep it safe and secure."] }), _jsx("div", { className: styles.writingAnimation, children: _jsx(DotLottieReact, { src: "https://lottie.host/253cdb9a-9579-4d3b-a47a-8cb81dc9cbe1/Xb403sqrnQ.lottie", loop: true, autoplay: true }) }), _jsx("div", { className: styles.buttonGroup, children: _jsx("button", { onClick: handleChataIdInfoClose, className: styles.submitButton, children: "I've Saved My CHATA ID" }) })] }) }))] }));
};
