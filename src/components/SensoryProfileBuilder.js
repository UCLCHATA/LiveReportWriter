import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { HelpCircle } from 'lucide-react';
import styles from './SensoryProfileBuilder.module.css';
const getSensitivityLabel = (value) => {
    switch (value) {
        case 1: return 'Significantly Under-responsive';
        case 2: return 'Under-responsive';
        case 3: return 'Typical';
        case 4: return 'Over-responsive';
        case 5: return 'Significantly Over-responsive';
        default: return 'Typical';
    }
};
const getDomainTooltip = (domain) => {
    switch (domain) {
        case 'Visual':
            return 'DSM-5 B.4 & ICF b156:\n• Hyper/hypo-reactivity to visual stimuli\n• Unusual interest in lights/spinning objects\n• Visual inspection behaviors\n• Peripheral vision use\n• Visual perception functions';
        case 'Auditory':
            return 'DSM-5 B.4 & ICF b230:\n• Hyper/hypo-reactivity to sounds\n• Adverse response to specific sounds\n• Sound discrimination difficulties\n• Sound seeking behaviors\n• Hearing functions';
        case 'Tactile':
            return 'DSM-5 B.4 & ICF b265:\n• Tactile defensiveness or seeking\n• Altered pain/temperature response\n• Unusual exploration of textures\n• Touch function impairments\n• Pressure sensitivity';
        case 'Vestibular':
            return 'DSM-5 B.4 & ICF b235:\n• Atypical movement patterns\n• Balance insecurity/seeking\n• Movement avoidance/craving\n• Vestibular function challenges\n• Spatial orientation';
        case 'Proprioceptive':
            return 'DSM-5 B.4 & ICF b260:\n• Body awareness difficulties\n• Postural control challenges\n• Motor planning issues\n• Proprioceptive function\n• Position/movement sense';
        case 'Oral':
            return 'DSM-5 B.4 & ICF b250:\n• Food texture sensitivities\n• Oral seeking behaviors\n• Taste/texture aversions\n• Gustatory functions\n• Eating challenges';
        default:
            return 'Rate sensory processing patterns in this domain';
    }
};
export const SensoryProfileGraph = ({ data }) => {
    if (!data?.domains)
        return null;
    const radarData = Object.values(data.domains).map(domain => ({
        domain: domain.name,
        sensitivity: domain.value || 0,
        fullMark: 5
    }));
    return (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(RadarChart, { data: radarData, margin: { top: 5, right: 25, bottom: 5, left: 25 }, children: [_jsx(PolarGrid, { gridType: "polygon", stroke: "#e5e7eb" }), _jsx(PolarAngleAxis, { dataKey: "domain", tick: { fontSize: 12, fill: '#4b5563' }, axisLine: { stroke: '#e5e7eb' } }), _jsx(PolarRadiusAxis, { angle: 30, domain: [0, 5], tickCount: 6, tick: { fontSize: 11, fill: '#6b7280' }, axisLine: false, scale: "linear", orientation: "middle", type: "number" }), _jsx(Radar, { name: "Sensitivity", dataKey: "sensitivity", stroke: "#4f46e5", fill: "#4f46e5", fillOpacity: 0.4, dot: false, isAnimationActive: true, animationBegin: 0, animationDuration: 500, animationEasing: "ease-out" })] }) }));
};
export const SensoryProfileBuilder = ({ data, onChange }) => {
    const [newObservation, setNewObservation] = useState('');
    const [selectedDomain, setSelectedDomain] = useState(null);
    // Initialize domains if not present in data
    useEffect(() => {
        if (!data?.domains) {
            onChange({
                domains: {
                    visual: { name: 'Visual', value: undefined, observations: [], label: 'Typical' },
                    auditory: { name: 'Auditory', value: undefined, observations: [], label: 'Typical' },
                    tactile: { name: 'Tactile', value: undefined, observations: [], label: 'Typical' },
                    vestibular: { name: 'Vestibular', value: undefined, observations: [], label: 'Typical' },
                    proprioceptive: { name: 'Proprioceptive', value: undefined, observations: [], label: 'Typical' },
                    oral: { name: 'Oral', value: undefined, observations: [], label: 'Typical' },
                }
            });
        }
    }, [data, onChange]);
    const handleSensitivityChange = (domain, value) => {
        if (!data?.domains)
            return;
        const updatedData = {
            type: 'sensoryProfile',
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
    const getSliderBackground = (value) => {
        const percentage = ((value - 1) / 4) * 100;
        return `linear-gradient(to right, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%)`;
    };
    const addObservation = (domain) => {
        if (!data?.domains || !newObservation.trim())
            return;
        const updatedData = {
            type: 'sensoryProfile',
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
    const handleUpdateDomain = (domainId, updates) => {
        const updatedData = {
            type: 'sensoryProfile',
            domains: {
                ...data.domains,
                [domainId]: {
                    ...data.domains[domainId],
                    ...updates
                }
            }
        };
        onChange(updatedData);
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
    return (_jsx("div", { className: styles.slidersGrid, children: Object.entries(data.domains).map(([key, domain]) => (_jsxs("div", { className: styles.domainSlider, children: [_jsxs("div", { className: styles.sliderHeader, children: [_jsx("span", { className: styles.domainName, children: domain.name }), _jsx("span", { className: styles.sensitivityLabel, children: domain.label }), _jsxs("div", { className: styles.tooltipWrapper, onMouseMove: handleTooltipPosition, children: [_jsx(HelpCircle, { className: styles.helpIcon, size: 14 }), _jsx("div", { className: styles.tooltipContent, children: getDomainTooltip(domain.name) })] })] }), _jsx("input", { type: "range", min: "1", max: "5", step: "1", value: domain.value || 3, onChange: (e) => handleSensitivityChange(key, Number(e.target.value)), className: styles.sensitivitySlider, style: { background: getSliderBackground(domain.value || 3) } }), _jsxs("div", { className: styles.observations, children: [domain.observations.map((obs, idx) => (_jsxs("div", { className: styles.observationItem, children: [_jsx("span", { children: obs }), _jsx("button", { className: styles.deleteObservation, onClick: () => deleteObservation(key, idx), "aria-label": "Delete observation", children: "\u00D7" })] }, idx))), _jsxs("div", { className: styles.addObservation, children: [_jsx("textarea", { placeholder: "Add observation...", value: selectedDomain === key ? newObservation : '', onChange: (e) => {
                                        setNewObservation(e.target.value);
                                        // Auto-resize
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }, onFocus: () => setSelectedDomain(key), onKeyPress: (e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            addObservation(key);
                                        }
                                    } }), _jsx("button", { onClick: () => addObservation(key), children: "+" })] })] })] }, key))) }));
};
