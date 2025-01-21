import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MilestoneTracker.module.css';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
const categoryInfo = {
    communication: {
        title: 'Communication',
        color: '#4299E1',
        tooltips: {
            'Babbling': 'Varied consonant-vowel combinations, speech-like sounds',
            'Name response': 'Consistently turns to name when called',
            'Points to show': 'Points to objects of interest to share attention',
            'First words': 'Uses specific words consistently with meaning',
            'Combines words': 'Puts two or more words together meaningfully'
        }
    },
    motor: {
        title: 'Motor Skills',
        color: '#48BB78',
        tooltips: {
            'Head control': 'Holds head steady without support',
            'Reaches & grasps': 'Actively reaches and grasps objects',
            'Independent sitting': 'Sits without support for extended period',
            'Independent walking': 'Walks without holding on',
            'Climbs & runs': 'Climbs furniture and runs steadily'
        }
    },
    social: {
        title: 'Social & Play',
        color: '#ED8936',
        tooltips: {
            'Social smile': 'Smiles in response to faces and voices',
            'Eye contact': 'Makes and maintains appropriate eye contact',
            'Imitation': 'Copies simple actions and expressions',
            'Pretend play': 'Engages in imaginative play with toys',
            'Interactive play': 'Plays cooperatively with others'
        }
    },
    concerns: {
        title: 'Developmental Concerns',
        color: '#9F7AEA',
        tooltips: {
            'Rigid play patterns': 'Repetitive play sequences, strong preference for sameness, difficulty with changes in routine',
            'Limited social engagement': 'Reduced social initiation, parallel play preference, limited peer interaction',
            'Sensory seeking/avoiding': 'Unusual responses to sensory input, covering ears, visual fascinations, tactile sensitivity',
            'custom-concern': 'Add a custom developmental concern'
        }
    }
};
const TimelineMonth = ({ month, maxAge }) => {
    const { setNodeRef } = useDroppable({
        id: `month-${month}`,
    });
    const shouldShowMarker = month % 6 === 0;
    const shouldShowThreeMonthMarker = month % 3 === 0 && !shouldShowMarker;
    return (_jsxs("div", { ref: setNodeRef, className: styles.monthMarker, style: {
            left: `${(month / maxAge) * 100}%`,
            opacity: shouldShowMarker ? 1 : shouldShowThreeMonthMarker ? 0.3 : 0
        }, children: [_jsx("div", { className: `${styles.markerLine} ${shouldShowThreeMonthMarker ? styles.threeMonthMarker : ''}` }), shouldShowMarker && (_jsx("span", { className: styles.markerLabel, children: month % 12 === 0 ? `${month / 12}y` : `${month}m` }))] }));
};
const CurrentPositionIndicator = ({ month, maxAge, category, verticalPosition }) => {
    return (_jsxs("div", { className: styles.currentPosition, style: {
            left: `${(month / maxAge) * 100}%`,
            bottom: `${verticalPosition * 100}%`,
            borderColor: categoryInfo[category].color,
            backgroundColor: `${categoryInfo[category].color}22`
        }, children: [_jsxs("span", { children: [month, "m"] }), _jsx("div", { className: styles.positionLine, style: {
                    transform: `scaleY(${verticalPosition > 0.5 ? 1 : -1})`
                } })] }));
};
const DraggableMilestone = React.memo(({ milestone, category, onCustomConcern }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [customText, setCustomText] = useState('');
    const [showDifference, setShowDifference] = useState(false);
    const inputRef = useRef(null);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: milestone.id,
        data: { milestone },
        disabled: milestone.id === 'custom-concern'
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    const getDifferenceText = () => {
        if (milestone.actualAge === undefined || milestone.expectedAge === 0)
            return null;
        const diff = milestone.actualAge - milestone.expectedAge;
        if (diff === 0)
            return null;
        return diff > 0 ? `+${diff}` : `${diff}`;
    };
    const differenceText = getDifferenceText();
    const isDelayed = milestone.actualAge !== undefined &&
        milestone.expectedAge !== 0 &&
        milestone.actualAge > milestone.expectedAge;
    const tooltipText = milestone.actualAge !== undefined
        ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}${differenceText ? ` - ${isDelayed ? 'Delayed' : 'Advanced'} by ${Math.abs(milestone.actualAge - milestone.expectedAge)}m` : ''}`
        : categoryInfo[category].tooltips[milestone.title] || milestone.title;
    const isEarly = milestone.actualAge !== undefined &&
        milestone.expectedAge !== 0 &&
        milestone.actualAge < milestone.expectedAge;
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && customText.trim()) {
            e.preventDefault();
            e.stopPropagation();
            onCustomConcern?.(customText.trim());
            setCustomText('');
            setIsEditing(false);
        }
        else if (e.key === 'Escape') {
            setIsEditing(false);
            setCustomText('');
        }
    };
    const handleCustomClick = (e) => {
        if (milestone.id === 'custom-concern' && !isEditing) {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };
    const handleBlur = () => {
        if (customText.trim()) {
            onCustomConcern?.(customText.trim());
        }
        setCustomText('');
        setIsEditing(false);
    };
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);
    const isCustom = milestone.id.startsWith('custom-concern-');
    const isCustomButton = milestone.id === 'custom-concern';
    return (_jsx(motion.div, { ref: isCustomButton ? undefined : setNodeRef, ...(!isCustomButton && !isEditing ? { ...attributes, ...listeners } : {}), className: `${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`, "data-category": category, "data-milestone-id": milestone.id, "data-custom": isCustom, "data-early": isEarly, "data-editing": isEditing, title: tooltipText, style: style, whileHover: { scale: isCustomButton ? 1 : 1.05 }, whileTap: { scale: isCustomButton ? 1 : 0.95 }, onClick: handleCustomClick, onMouseEnter: () => setShowDifference(true), onMouseLeave: () => setShowDifference(false), children: isEditing ? (_jsx("input", { ref: inputRef, type: "text", value: customText, onChange: (e) => setCustomText(e.target.value), onKeyDown: handleKeyDown, onBlur: handleBlur, className: styles.customInput, placeholder: "Type concern and press Enter", maxLength: 50, autoFocus: true })) : (_jsxs(_Fragment, { children: [milestone.title, milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (_jsx("div", { className: styles.monthCircle, "data-delayed": isDelayed, "data-early": !isDelayed, children: _jsx("span", { className: `${styles.monthText} ${showDifference ? styles.showDifference : ''} ${isDelayed ? styles.delayedText : styles.advancedText}`, children: showDifference && differenceText ? differenceText : `${milestone.actualAge}m` }) }))] })) }));
});
const CARD_WIDTH = 120; // Approximate width of a milestone card in pixels
const MONTH_WIDTH = 1.4; // Width of one month in percentage of timeline
const getStackPosition = (milestones, currentMonth, currentId) => {
    const draggedMilestone = milestones.find(m => m.id === currentId);
    if (!draggedMilestone)
        return 0;
    const placedMilestones = milestones
        .filter(m => m.actualAge !== undefined && m.id !== currentId);
    let row = 0; // Always start from top
    let hasOverlap = true;
    const maxRows = 7;
    while (hasOverlap && row < maxRows) {
        hasOverlap = placedMilestones.some((m) => {
            const distance = Math.abs((m.actualAge || 0) - currentMonth);
            const mightOverlap = distance <= 20;
            const sameRow = milestones
                .find((existing) => existing.id === m.id)?.stackPosition === row;
            return mightOverlap && sameRow;
        });
        if (hasOverlap) {
            row++;
        }
    }
    // If we've hit the limit, find the least crowded row
    if (row >= maxRows) {
        const rowCounts = new Array(maxRows).fill(0);
        placedMilestones.forEach(m => {
            const mRow = m.stackPosition || 0;
            if (mRow < maxRows) {
                rowCounts[mRow]++;
            }
        });
        row = rowCounts.indexOf(Math.min(...rowCounts));
    }
    return row;
};
const determineStatus = (actualAge, expectedAge) => {
    const difference = actualAge - expectedAge;
    if (difference <= 2) {
        return 'typical';
    }
    else if (difference <= 6) {
        return 'monitor';
    }
    else {
        return 'delayed';
    }
};
const initialMilestones = [
    // Communication milestones
    { id: 'babbling', title: 'Babbling', category: 'communication', expectedAge: 6 },
    { id: 'name-response', title: 'Name response', category: 'communication', expectedAge: 9 },
    { id: 'points-to-show', title: 'Points to show', category: 'communication', expectedAge: 12 },
    { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
    { id: 'combines-words', title: 'Combines words', category: 'communication', expectedAge: 24 },
    // Motor milestones
    { id: 'head-control', title: 'Head control', category: 'motor', expectedAge: 3 },
    { id: 'reaches-grasps', title: 'Reaches & grasps', category: 'motor', expectedAge: 5 },
    { id: 'independent-sitting', title: 'Independent sitting', category: 'motor', expectedAge: 8 },
    { id: 'independent-walking', title: 'Independent walking', category: 'motor', expectedAge: 12 },
    { id: 'climbs-runs', title: 'Climbs & runs', category: 'motor', expectedAge: 18 },
    // Social milestones
    { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
    { id: 'eye-contact', title: 'Eye contact', category: 'social', expectedAge: 3 },
    { id: 'imitation', title: 'Imitation', category: 'social', expectedAge: 9 },
    { id: 'pretend-play', title: 'Pretend play', category: 'social', expectedAge: 18 },
    { id: 'interactive-play', title: 'Interactive play', category: 'social', expectedAge: 24 },
    // Developmental concerns
    {
        id: 'rigid-play',
        title: 'Rigid play patterns',
        category: 'concerns',
        expectedAge: 0
    },
    {
        id: 'limited-social',
        title: 'Limited social engagement',
        category: 'concerns',
        expectedAge: 0
    },
    {
        id: 'sensory-patterns',
        title: 'Sensory seeking/avoiding',
        category: 'concerns',
        expectedAge: 0
    },
    {
        id: 'custom-concern',
        title: '+',
        category: 'concerns',
        expectedAge: 0
    }
];
const HistoryTextBox = ({ value, onChange }) => {
    const [localValue, setLocalValue] = useState(value || '');
    // Update local value when prop changes
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);
    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };
    const handleBlur = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };
    const placeholderText = `Document history of concerns, including:
• Age when parents first noticed differences
• Early signs (e.g., limited eye contact, delayed babbling)
• Response to name and social engagement
• Changes in development patterns
• Environmental factors and adaptations
• Impact on daily activities and routines
• Family history of developmental conditions`;
    return (_jsxs("div", { className: styles.historyBox, children: [_jsx("h3", { children: "History of Concerns" }), _jsx("div", { className: styles.textareaWrapper, children: _jsx("textarea", { value: localValue, onChange: handleChange, onBlur: handleBlur, placeholder: placeholderText, className: styles.historyTextarea }) })] }));
};
const STORAGE_KEY = 'milestone_data';
const CACHE_KEY = 'milestone_cache';
export const MilestoneTracker = React.memo(({ data, onChange }) => {
    const [activeMilestone, setActiveMilestone] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(null);
    const [verticalPosition, setVerticalPosition] = useState(0);
    const [includeInReport, setIncludeInReport] = useState(false);
    const timelineRef = useRef(null);
    const wrapperRef = useRef(null);
    const maxAge = 72;
    const [customConcernCount, setCustomConcernCount] = useState(0);
    const lastSaveRef = useRef(0);
    const MIN_SAVE_INTERVAL = 1000; // 1 second minimum between saves
    // Initialize data if not present
    useEffect(() => {
        if (!data || !data.milestones || data.milestones.length === 0) {
            onChange({
                type: 'milestoneTracker',
                milestones: initialMilestones,
                history: '',
                lastUpdated: new Date().toISOString()
            });
        }
    }, [data, onChange]);
    const milestones = data?.milestones || initialMilestones;
    const historyText = data?.history || '';
    // Memoize milestone calculations
    const processedMilestones = useMemo(() => {
        return milestones.map(milestone => ({
            ...milestone,
            stackPosition: getStackPosition(milestones, currentMonth, milestone.id),
            status: milestone.actualAge ? determineStatus(milestone.actualAge, milestone.expectedAge) : 'pending'
        }));
    }, [milestones, currentMonth]);
    const shouldSave = useCallback(() => {
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveRef.current;
        return timeSinceLastSave >= MIN_SAVE_INTERVAL;
    }, []);
    const handleHistoryChange = useCallback((text) => {
        const updatedData = {
            type: 'milestoneTracker',
            milestones,
            history: text,
            lastUpdated: new Date().toISOString()
        };
        onChange(updatedData);
    }, [milestones, onChange]);
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over)
            return;
        const month = parseInt(over.id.toString().replace('month-', ''));
        const draggedMilestone = milestones.find((m) => m.id === active.id);
        if (!draggedMilestone)
            return;
        const status = determineStatus(month, draggedMilestone.expectedAge);
        const updatedMilestones = milestones.map((m) => m.id === active.id ? {
            ...m,
            actualAge: month,
            stackPosition: getStackPosition(milestones, month, active.id.toString()),
            status
        } : m);
        if (!shouldSave())
            return;
        const updatedData = {
            type: 'milestoneTracker',
            milestones: updatedMilestones,
            history: historyText,
            lastUpdated: new Date().toISOString()
        };
        lastSaveRef.current = Date.now();
        onChange(updatedData);
        setActiveMilestone(null);
        setCurrentMonth(null);
    }, [milestones, historyText, onChange, shouldSave]);
    const handleCustomConcern = useCallback((text) => {
        if (!shouldSave())
            return;
        const newMilestone = {
            id: `custom-concern-${Date.now()}`,
            title: text,
            category: 'concerns',
            expectedAge: 0
        };
        const updatedMilestones = [...milestones.filter(m => m.id !== 'custom-concern'), newMilestone, {
                id: 'custom-concern',
                title: '+',
                category: 'concerns',
                expectedAge: 0
            }];
        const updatedData = {
            type: 'milestoneTracker',
            milestones: updatedMilestones,
            history: historyText,
            lastUpdated: new Date().toISOString()
        };
        lastSaveRef.current = Date.now();
        onChange(updatedData);
    }, [milestones, historyText, onChange, shouldSave]);
    const handleDragStart = useCallback((event) => {
        const draggedMilestone = milestones.find((m) => m.id === event.active.id);
        setActiveMilestone(draggedMilestone || null);
    }, [milestones]);
    const handleDragMove = useCallback((event) => {
        if (!event.over)
            return;
        const month = parseInt(event.over.id.toString().replace('month-', ''));
        const timeline = document.querySelector(`.${styles.timeline}`);
        if (timeline) {
            const rect = timeline.getBoundingClientRect();
            const y = rect.height - Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
            setCurrentMonth(month);
            setVerticalPosition(y / rect.height);
        }
    }, []);
    const captureTimelineImage = async () => {
        if (wrapperRef.current) {
            try {
                // Store original styles
                const originalMargin = wrapperRef.current.style.marginBottom;
                const originalHeight = wrapperRef.current.style.height;
                // Set temporary styles for capture
                wrapperRef.current.style.marginBottom = '0px';
                wrapperRef.current.style.height = '240px'; // Increased height to accommodate labels
                const canvas = await html2canvas(wrapperRef.current, {
                    backgroundColor: null,
                    scale: 2,
                    logging: false,
                    allowTaint: true,
                    useCORS: true,
                    onclone: (clonedDoc) => {
                        const clonedWrapper = clonedDoc.querySelector(`.${styles.timelineWrapper}`);
                        if (clonedWrapper) {
                            clonedWrapper.style.marginBottom = '0px';
                            clonedWrapper.style.height = '240px';
                            // Make all month markers and labels visible
                            const markers = clonedWrapper.querySelectorAll(`.${styles.monthMarker}`);
                            markers.forEach((marker) => {
                                marker.style.opacity = '1';
                                const markerLine = marker.querySelector(`.${styles.markerLine}`);
                                if (markerLine) {
                                    markerLine.style.opacity = '1';
                                }
                                const label = marker.querySelector(`.${styles.markerLabel}`);
                                if (label) {
                                    label.style.opacity = '1';
                                    label.style.visibility = 'visible';
                                    label.style.bottom = '-25px';
                                }
                            });
                        }
                    }
                });
                // Restore original styles
                wrapperRef.current.style.marginBottom = originalMargin;
                wrapperRef.current.style.height = originalHeight;
                return canvas.toDataURL('image/png');
            }
            catch (error) {
                console.error('Error capturing timeline image:', error);
                return null;
            }
        }
        return null;
    };
    const handleIncludeInReportToggle = async () => {
        setIncludeInReport(prev => !prev);
        if (!includeInReport) {
            try {
                const timelineImage = await captureTimelineImage();
                if (timelineImage) {
                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = timelineImage;
                    link.download = 'Developmental timeline.png';
                    // Show dialog to user
                    const userConfirmed = window.confirm('The image will be downloaded. Please save it and manually add it to your generated report.');
                    if (userConfirmed) {
                        // Trigger download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            }
            catch (error) {
                console.error('Error capturing timeline image:', error);
            }
        }
    };
    useEffect(() => {
        const updateData = async () => {
            if (includeInReport) {
                const timelineImage = await captureTimelineImage();
                onChange({
                    ...data,
                    timelineImage,
                    includeTimelineInReport: true,
                    lastUpdated: new Date().toISOString()
                });
            }
            else {
                onChange({
                    ...data,
                    timelineImage: null,
                    includeTimelineInReport: false,
                    lastUpdated: new Date().toISOString()
                });
            }
        };
        updateData();
    }, [includeInReport, onChange, data]);
    // Debounce the mark complete/undo handler
    const handleMarkComplete = useCallback(debounce((milestone, isComplete) => {
        if (currentMonth === null)
            return;
        const updatedMilestones = milestones.map((m) => {
            if (m.id === milestone.id) {
                return {
                    ...m,
                    actualAge: isComplete ? currentMonth : undefined
                };
            }
            return m;
        });
        onChange({ ...data, milestones: updatedMilestones });
    }, 300), [milestones, currentMonth, onChange, data]);
    return (_jsxs("div", { className: styles.container, children: [_jsxs(DndContext, { onDragStart: handleDragStart, onDragMove: handleDragMove, onDragEnd: handleDragEnd, children: [_jsx("div", { className: styles.categoriesContainer, children: Object.entries(categoryInfo).map(([category, info]) => (_jsxs("div", { className: styles.category, children: [_jsx("h3", { children: info.title }), _jsx("div", { className: styles.milestoneList, children: milestones
                                        .filter((m) => m.category === category && !m.actualAge)
                                        .map((milestone) => (_jsx(DraggableMilestone, { milestone: milestone, category: category, onCustomConcern: handleCustomConcern }, milestone.id))) })] }, category))) }), _jsxs("div", { ref: wrapperRef, className: styles.timelineWrapper, children: [_jsxs("button", { className: styles.includeInReportButton, onClick: handleIncludeInReportToggle, title: includeInReport ? "Remove from report" : "Include in report", "data-included": includeInReport, children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: includeInReport ? (_jsx("path", { d: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" })) : (_jsx("path", { d: "M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" })) }), includeInReport ? "Remove from Report" : "Include in Report"] }), _jsxs("div", { ref: timelineRef, className: styles.timeline, children: [Array.from({ length: maxAge + 1 }, (_, i) => (_jsx(TimelineMonth, { month: i, maxAge: maxAge }, i))), activeMilestone && (_jsx("div", { className: styles.expectedAgeIndicator, style: {
                                            left: `${(activeMilestone.expectedAge / maxAge) * 100}%`,
                                            backgroundColor: categoryInfo[activeMilestone.category].color
                                        }, children: _jsxs("div", { className: styles.indicatorLabel, children: ["Expected: ", activeMilestone.expectedAge, "m"] }) })), activeMilestone && currentMonth !== null && (_jsx(CurrentPositionIndicator, { month: currentMonth, maxAge: maxAge, category: activeMilestone.category, verticalPosition: verticalPosition })), _jsx("div", { className: styles.placedMilestones, children: _jsx(AnimatePresence, { children: milestones
                                                .filter((m) => m.actualAge !== undefined)
                                                .map((milestone) => (_jsx(motion.div, { className: styles.timelineMilestone, style: {
                                                    left: `${(milestone.actualAge || 0) / maxAge * 100}%`,
                                                    top: `${(milestone.stackPosition || 0) * 30}px`,
                                                    transform: 'translate(-50%, 0)'
                                                }, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, children: _jsx(DraggableMilestone, { milestone: milestone, category: milestone.category }) }, milestone.id))) }) })] })] })] }), _jsx(HistoryTextBox, { value: historyText, onChange: handleHistoryChange })] }));
});
export default MilestoneTracker;
