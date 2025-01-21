import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './SocialCommunicationProfile.module.css';
const getSensitivityLabel = (value) => {
    switch (value) {
        case 1: return 'Age Appropriate';
        case 2: return 'Subtle Differences';
        case 3: return 'Emerging';
        case 4: return 'Limited';
        case 5: return 'Significantly Limited';
        default: return 'Emerging';
    }
};
const getDomainTooltip = (domain) => {
    switch (domain) {
        case 'Joint Attention':
            return 'DSM-5 A.1 & ICF b122:\n• Social-emotional reciprocity\n• Initiation of social interaction\n• Sharing of interests/emotions\n• Response to social approaches\n• Psychosocial functions';
        case 'Social Reciprocity':
            return 'DSM-5 A.1 & ICF d710:\n• Back-and-forth communication\n• Emotional engagement\n• Social imitation skills\n• Basic interpersonal interactions\n• Relationship maintenance';
        case 'Verbal Communication':
            return 'DSM-5 A.2 & ICF b167:\n• Expressive language skills\n• Conversation abilities\n• Language pragmatics\n• Mental functions of language\n• Speech patterns/prosody';
        case 'Non-verbal Communication':
            return 'DSM-5 A.2 & ICF b1671:\n• Gesture use and understanding\n• Facial expression range\n• Eye contact quality\n• Expression of language\n• Body language interpretation';
        case 'Social Understanding':
            return 'DSM-5 A.3 & ICF d720:\n• Relationship comprehension\n• Social context adaptation\n• Complex social interactions\n• Social inference abilities\n• Boundary awareness';
        case 'Play Skills':
            return 'DSM-5 A.3 & ICF d880:\n• Imaginative play development\n• Symbolic play abilities\n• Social play engagement\n• Engagement in play\n• Play flexibility';
        default:
            return 'Rate social communication abilities in this domain';
    }
};
const getSliderBackground = (value) => {
    const percentage = ((value - 1) / 4) * 100;
    return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
};
export const SocialCommunicationGraph = ({ data }) => {
    if (!data?.domains)
        return null;
    const chartData = Object.values(data.domains).map(domain => ({
        subject: domain.name,
        A: domain.value,
        fullMark: 5,
    }));
    return (_jsx("div", { className: styles.graphContainer, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { cx: "50%", cy: "50%", outerRadius: "80%", data: chartData, children: [_jsx(PolarGrid, { gridType: "polygon" }), _jsx(PolarAngleAxis, { dataKey: "subject", tick: { fontSize: 12 } }), _jsx(PolarRadiusAxis, { angle: 30, domain: [0, 5], tickCount: 6, tick: { fontSize: 11 }, scale: "linear", allowDataOverflow: false }), _jsx(Radar, { name: "Social Communication", dataKey: "A", stroke: "#4f46e5", fill: "#4f46e5", fillOpacity: 0.5 })] }) }) }));
};
export const SocialCommunicationProfile = ({ data, onChange }) => {
    const [newObservation, setNewObservation] = useState('');
    const [selectedDomain, setSelectedDomain] = useState(null);
    // Initialize domains if not present in data
    useEffect(() => {
        if (!data?.domains) {
            onChange({
                domains: {
                    jointAttention: { name: 'Joint Attention', value: undefined, observations: [], label: 'Emerging' },
                    socialReciprocity: { name: 'Social Reciprocity', value: undefined, observations: [], label: 'Emerging' },
                    verbalCommunication: { name: 'Verbal Communication', value: undefined, observations: [], label: 'Emerging' },
                    nonverbalCommunication: { name: 'Non-verbal Communication', value: undefined, observations: [], label: 'Emerging' },
                    socialUnderstanding: { name: 'Social Understanding', value: undefined, observations: [], label: 'Emerging' },
                    playSkills: { name: 'Play Skills', value: undefined, observations: [], label: 'Emerging' },
                }
            });
        }
    }, [data, onChange]);
    const handleSensitivityChange = (domain, value) => {
        if (!data?.domains)
            return;
        const updatedData = {
            type: 'socialCommunication',
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
            type: 'socialCommunication',
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
