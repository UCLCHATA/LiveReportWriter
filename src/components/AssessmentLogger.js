import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './AssessmentLogger.module.css';
import { debounce } from 'lodash';
// Assessment tools data with proper categorization
export const assessmentTools = {
    core_diagnostic: [
        { id: 'ados2', name: 'ADOS-2', color: '#4299E1', category: 'Core Diagnostic' },
        { id: '3di', name: '3Di', color: '#48BB78', category: 'Core Diagnostic' },
        { id: 'adir', name: 'ADI-R', color: '#ED8936', category: 'Core Diagnostic' }
    ],
    developmental: [
        { id: 'vineland3', name: 'Vineland-3', color: '#9F7AEA', category: 'Developmental' },
        { id: 'bayley4', name: 'Bayley-4', color: '#F687B3', category: 'Developmental' }
    ],
    cognitive_attention: [
        { id: 'qbtest', name: 'QbTest', color: '#4FD1C5', category: 'Cognitive & Attention' },
        { id: 'conners3', name: 'Conners-3', color: '#F6AD55', category: 'Cognitive & Attention' }
    ],
    language_communication: [
        { id: 'celf5', name: 'CELF-5', color: '#667EEA', category: 'Language & Communication' },
        { id: 'pls5', name: 'PLS-5', color: '#FC8181', category: 'Language & Communication' }
    ],
    other: [
        { id: 'other', name: 'Other Assessment', color: '#94A3B8', category: 'Other' }
    ]
};
const AssessmentBubble = ({ assessment, isSelected, onClick }) => (_jsx(motion.button, { onClick: onClick, className: `${styles.bubble} ${isSelected ? styles.selected : ''}`, style: {
        background: isSelected ? assessment.color : undefined,
        borderColor: isSelected ? assessment.color : undefined
    }, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: assessment.name }));
const AssessmentEntry = ({ assessment, onUpdate, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customTitle, setCustomTitle] = useState(assessment.id === 'other' ? assessment.name : '');
    const [localNotes, setLocalNotes] = useState(assessment.notes || '');
    // Debounced update functions
    const debouncedUpdateNotes = useCallback(debounce((id, notes) => {
        onUpdate(id, { notes });
    }, 1000), [onUpdate]);
    const debouncedUpdateTitle = useCallback(debounce((id, name) => {
        onUpdate(id, { name: name || 'Other Assessment' });
    }, 1000), [onUpdate]);
    useEffect(() => {
        setLocalNotes(assessment.notes || '');
    }, [assessment.notes]);
    useEffect(() => {
        setCustomTitle(assessment.id === 'other' ? assessment.name : assessment.name);
    }, [assessment.id, assessment.name]);
    const handleNotesChange = (e) => {
        const newNotes = e.target.value;
        setLocalNotes(newNotes);
        debouncedUpdateNotes(assessment.id, newNotes);
    };
    const handleCustomTitleChange = (e) => {
        const newTitle = e.target.value;
        setCustomTitle(newTitle);
        debouncedUpdateTitle(assessment.id, newTitle);
    };
    const handleDoubleClick = () => {
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 }, className: styles.assessmentEntry, children: [_jsxs("div", { className: styles.entryHeader, children: [_jsxs("div", { className: styles.entryTitle, children: [_jsx("div", { className: styles.entryColor, style: { backgroundColor: assessment.color } }), assessment.id === 'other' ? (_jsx("input", { type: "text", value: customTitle, onChange: handleCustomTitleChange, placeholder: "Enter assessment name", className: styles.customTitleInput })) : (_jsx("span", { className: styles.entryName, children: assessment.name })), _jsx("span", { className: styles.entryCategory, children: assessment.category })] }), _jsxs("div", { className: styles.entryControls, children: [_jsx("input", { type: "date", value: assessment.date || '', onChange: (e) => onUpdate(assessment.id, { date: e.target.value }), className: styles.dateInput }), _jsx("button", { onClick: () => onRemove(assessment.id), className: styles.removeButton, children: _jsx(X, { size: 12 }) })] })] }), _jsx("div", { className: styles.doubleClickHint, children: "Double-click to expand" }), _jsx("div", { className: styles.entryContent, onDoubleClick: handleDoubleClick, children: _jsx("textarea", { value: localNotes, onChange: handleNotesChange, placeholder: "Add key observations and conclusions...", className: styles.notesInput, rows: 3 }) })] }), isModalOpen && (_jsx("div", { className: styles.modalOverlay, onClick: handleModalClose, children: _jsxs("div", { className: styles.modalContent, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: styles.modalHeader, children: [_jsxs("h3", { className: styles.modalTitle, children: [_jsx("div", { className: styles.entryColor, style: { backgroundColor: assessment.color } }), assessment.id === 'other' ? (_jsx("input", { type: "text", value: customTitle, onChange: handleCustomTitleChange, placeholder: "Enter assessment name", className: styles.customTitleInput })) : (assessment.name)] }), _jsx("button", { className: styles.closeButton, onClick: handleModalClose, children: _jsx(X, { size: 16 }) })] }), _jsx("textarea", { value: localNotes, onChange: handleNotesChange, placeholder: "Add key observations and conclusions...", className: styles.modalTextarea, autoFocus: true })] }) }))] }));
};
export const AssessmentLogger = ({ data, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const lastSaveRef = useRef(0);
    const MIN_SAVE_INTERVAL = 2000; // Increased to 2 seconds
    // Initialize state from props or create default with proper typing
    const assessmentLog = useMemo(() => {
        const defaultState = {
            type: 'assessmentLog',
            selectedAssessments: [],
            entries: {},
            progress: 0,
            isComplete: false,
            lastUpdated: new Date().toISOString()
        };
        if (!data)
            return defaultState;
        // Ensure proper data structure
        return {
            ...defaultState,
            ...data,
            selectedAssessments: data.selectedAssessments?.map((assessment) => ({
                ...assessment,
                date: assessment.date || '',
                notes: assessment.notes || '',
                status: assessment.status || 'pending'
            })) || [],
            entries: data.entries ? Object.fromEntries(Object.entries(data.entries).map(([key, entry]) => [
                key,
                {
                    ...entry,
                    date: entry.date || '',
                    notes: entry.notes || '',
                    status: entry.status || 'pending'
                }
            ])) : {},
            lastUpdated: data.lastUpdated || new Date().toISOString()
        };
    }, [data]);
    const { selectedAssessments = [], entries: assessmentEntries = {} } = assessmentLog;
    const shouldSave = useCallback(() => {
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveRef.current;
        return timeSinceLastSave >= MIN_SAVE_INTERVAL;
    }, []);
    const handleToggleAssessment = useCallback((assessment) => {
        if (!shouldSave())
            return;
        const exists = selectedAssessments.find((a) => a.id === assessment.id);
        const newState = {
            ...assessmentLog,
            selectedAssessments: exists
                ? selectedAssessments.filter((a) => a.id !== assessment.id)
                : [...selectedAssessments, {
                        ...assessment,
                        date: '',
                        notes: '',
                        status: 'pending'
                    }],
            entries: exists
                ? Object.fromEntries(Object.entries(assessmentEntries).filter(([key]) => key !== assessment.id))
                : {
                    ...assessmentEntries,
                    [assessment.id]: {
                        id: assessment.id,
                        name: assessment.name,
                        category: assessment.category,
                        color: assessment.color,
                        date: '',
                        notes: '',
                        status: 'pending',
                        addedAt: new Date().toISOString()
                    }
                },
            lastUpdated: new Date().toISOString()
        };
        lastSaveRef.current = Date.now();
        onChange(newState);
    }, [assessmentLog, selectedAssessments, assessmentEntries, onChange, shouldSave]);
    const handleUpdateAssessment = useCallback((id, updates) => {
        if (!shouldSave())
            return;
        const newState = {
            ...assessmentLog,
            entries: {
                ...assessmentEntries,
                [id]: {
                    ...assessmentEntries[id],
                    ...updates,
                    lastModified: new Date().toISOString()
                }
            },
            lastUpdated: new Date().toISOString()
        };
        lastSaveRef.current = Date.now();
        onChange(newState);
    }, [assessmentLog, assessmentEntries, onChange, shouldSave]);
    const handleRemoveAssessment = useCallback((id) => {
        if (!shouldSave())
            return;
        const newState = {
            ...assessmentLog,
            selectedAssessments: selectedAssessments.filter((a) => a.id !== id),
            entries: Object.fromEntries(Object.entries(assessmentEntries).filter(([key]) => key !== id)),
            lastUpdated: new Date().toISOString()
        };
        lastSaveRef.current = Date.now();
        onChange(newState);
    }, [assessmentLog, selectedAssessments, assessmentEntries, onChange, shouldSave]);
    // Calculate and update progress whenever assessments change
    useEffect(() => {
        const totalAssessments = selectedAssessments.length;
        if (totalAssessments === 0)
            return;
        const completedAssessments = selectedAssessments.filter((assessment) => assessment.date && assessment.notes && assessment.status === 'completed').length;
        const progress = Math.round((completedAssessments / totalAssessments) * 100);
        const isComplete = completedAssessments === totalAssessments;
        if (progress !== assessmentLog.progress || isComplete !== assessmentLog.isComplete) {
            onChange({
                ...assessmentLog,
                progress,
                isComplete,
                lastUpdated: new Date().toISOString()
            });
        }
    }, [selectedAssessments, assessmentLog, onChange]);
    return (_jsx("div", { className: styles.container, children: _jsxs("div", { className: styles.content, children: [_jsx("div", { className: styles.bubbleGrid, children: Object.entries(assessmentTools).map(([key, tools]) => tools.map((assessment) => (_jsx(AssessmentBubble, { assessment: assessment, isSelected: selectedAssessments?.some((a) => a.id === assessment.id) || false, onClick: () => handleToggleAssessment(assessment) }, assessment.id)))) }), selectedAssessments?.length > 0 && (_jsxs("div", { className: styles.assessmentEntries, children: [_jsx("div", { className: styles.entriesHeader, children: _jsx("h3", { className: styles.entriesTitle, children: "Selected Assessments" }) }), _jsx("div", { className: styles.entriesList, children: _jsx(AnimatePresence, { children: selectedAssessments.map((assessment, index) => (_jsxs(React.Fragment, { children: [_jsx(AssessmentEntry, { assessment: {
                                                ...assessment,
                                                ...assessmentEntries[assessment.id]
                                            }, onUpdate: handleUpdateAssessment, onRemove: handleRemoveAssessment }), index < selectedAssessments.length - 1 && (_jsx("div", { className: styles.separator }))] }, assessment.id))) }) })] }))] }) }));
};
export default AssessmentLogger;
