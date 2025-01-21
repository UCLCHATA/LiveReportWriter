import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './BehaviorInterestsProfile.module.css';
const getSensitivityLabel = (value) => {
    switch (value) {
        case 1: return 'Not Present';
        case 2: return 'Minimal Impact';
        case 3: return 'Moderate Impact';
        case 4: return 'Significant Impact';
        case 5: return 'Severe Impact';
        default: return 'Moderate Impact';
    }
};
const getDomainTooltip = (domain) => {
    switch (domain) {
        case 'Repetitive Behaviors':
            return 'DSM-5 B.1 & ICF b147:\n• Stereotyped movements\n• Motor mannerisms\n• Object manipulation\n• Repetitive speech\n• Psychomotor functions';
        case 'Restricted Interests':
            return 'DSM-5 B.3 & ICF b1301:\n• Interest intensity\n• Topic perseveration\n• Focus fixation\n• Motivation functions\n• Interest flexibility';
        case 'Sensory Seeking':
            return 'DSM-5 B.4 & ICF b250-b270:\n• Sensory exploration\n• Stimulation seeking\n• Sensory avoidance\n• Sensory functions\n• Environmental interaction';
        case 'Routine Adherence':
            return 'DSM-5 B.2 & ICF b1641:\n• Routine rigidity\n• Change resistance\n• Ritual behaviors\n• Organization of events\n• Schedule adherence';
        case 'Flexibility':
            return 'DSM-5 B.2 & ICF d175:\n• Cognitive flexibility\n• Adaptation ability\n• Problem solving\n• Solving problems\n• Alternative approaches';
        case 'Activity Transitions':
            return 'DSM-5 B.2 & ICF d230:\n• Transition management\n• Activity switching\n• Daily routine\n• Carrying out daily routine\n• Schedule changes';
        default:
            return 'Rate behavioral patterns and their impact on daily functioning';
    }
};
const getSliderBackground = (value) => {
    const percentage = ((value - 1) / 4) * 100;
    return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
};
export const BehaviorInterestsGraph = ({ data }) => {
    if (!data?.domains)
        return null;
    const chartData = Object.values(data.domains).map(domain => ({
        subject: domain.name,
        A: domain.value,
        fullMark: 5,
    }));
    return (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { cx: "50%", cy: "50%", outerRadius: "80%", data: chartData, children: [_jsx(PolarGrid, { gridType: "polygon" }), _jsx(PolarAngleAxis, { dataKey: "subject", tick: { fontSize: 12 } }), _jsx(PolarRadiusAxis, { angle: 30, domain: [0, 5], tickCount: 6, tick: { fontSize: 11 }, scale: "linear", allowDataOverflow: false }), _jsx(Radar, { name: "Behavior & Interests", dataKey: "A", stroke: "#4f46e5", fill: "#4f46e5", fillOpacity: 0.5 })] }) }));
};
export const BehaviorInterestsProfile = ({ data, onChange }) => {
    const [newObservation, setNewObservation] = useState('');
    const [selectedDomain, setSelectedDomain] = useState(null);
    // Initialize domains if not present in data
    useEffect(() => {
        if (!data?.domains) {
            onChange({
                domains: {
                    repetitiveBehaviors: { name: 'Repetitive Behaviors', value: undefined, observations: [], label: 'Moderate Impact' },
                    restrictedInterests: { name: 'Restricted Interests', value: undefined, observations: [], label: 'Moderate Impact' },
                    sensorySeeking: { name: 'Sensory Seeking', value: undefined, observations: [], label: 'Moderate Impact' },
                    routineAdherence: { name: 'Routine Adherence', value: undefined, observations: [], label: 'Moderate Impact' },
                    flexibility: { name: 'Flexibility', value: undefined, observations: [], label: 'Moderate Impact' },
                    activityTransitions: { name: 'Activity Transitions', value: undefined, observations: [], label: 'Moderate Impact' },
                }
            });
        }
    }, [data, onChange]);
    const handleSensitivityChange = (domain, value) => {
        if (!data?.domains)
            return;
        const updatedData = {
            type: 'behaviorInterests',
            domains: {
                ...data.domains,
                [domain]: {
                    ...data.domains[domain],
                    value,
                    label: getSensitivityLabel(value)
                }
            }
        };
        onChange(updatedData);
    };
    const addObservation = (domain) => {
        if (!data?.domains || !newObservation.trim())
            return;
        const updatedData = {
            type: 'behaviorInterests',
            domains: {
                ...data.domains,
                [domain]: {
                    ...data.domains[domain],
                    observations: [...(data.domains[domain].observations || []), newObservation.trim()]
                }
            }
        };
        onChange(updatedData);
        setNewObservation('');
    };
    const deleteObservation = (domain, index) => {
        if (!data?.domains)
            return;
        onChange({
            domains: {
                ...data.domains,
                [domain]: {
                    ...data.domains[domain],
                    observations: data.domains[domain].observations.filter((_, i) => i !== index)
                }
            }
        });
    };
    const handleTooltipPosition = (e) => {
        const tooltip = e.currentTarget.querySelector(`.${styles.tooltipContent}`);
        if (!tooltip)
            return;
        // Get cursor position
        const cursorX = e.clientX;
        const cursorY = e.clientY;
        // Get viewport dimensions
        const viewportHeight = window.innerHeight;
        // Get tooltip dimensions
        const tooltipHeight = tooltip.offsetHeight;
        // Calculate vertical position - always try to position below cursor first
        let top = cursorY + 8;
        // If tooltip would overflow bottom of viewport, position above cursor
        if (top + tooltipHeight > viewportHeight - 10) {
            top = cursorY - tooltipHeight - 8;
        }
        // Apply vertical position only (horizontal is handled by CSS)
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${cursorX}px`; // Base position for CSS transforms
    };
    if (!data?.domains)
        return null;
    return (_jsx("div", { className: styles.slidersGrid, children: Object.entries(data.domains).map(([key, domain]) => (_jsxs("div", { className: styles.domainSlider, children: [_jsxs("div", { className: styles.sliderHeader, children: [_jsx("span", { className: styles.domainName, children: domain.name }), _jsx("span", { className: styles.sensitivityLabel, children: domain.label }), _jsxs("div", { className: styles.tooltipWrapper, onMouseMove: handleTooltipPosition, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 14 }), _jsx("div", { className: styles.tooltipContent, children: getDomainTooltip(domain.name) })] })] }), _jsx("input", { type: "range", min: 1, max: 5, value: domain.value || 3, onChange: (e) => handleSensitivityChange(key, parseInt(e.target.value)), className: styles.sensitivitySlider, style: { background: getSliderBackground(domain.value || 3) } }), _jsxs("div", { className: styles.observations, children: [domain.observations.map((obs, obsIndex) => (_jsxs("div", { className: styles.observationItem, children: [obs, _jsx("button", { onClick: () => deleteObservation(key, obsIndex), className: styles.deleteObservation, children: "\u00D7" })] }, obsIndex))), _jsxs("div", { className: styles.addObservation, children: [_jsx("input", { type: "text", value: selectedDomain === key ? newObservation : '', onChange: (e) => setNewObservation(e.target.value), onFocus: () => setSelectedDomain(key), onKeyPress: (e) => e.key === 'Enter' && addObservation(key), placeholder: "Add observation..." }), _jsx("button", { onClick: () => addObservation(key), children: "Add" })] })] })] }, key))) }));
};
