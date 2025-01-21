import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './DevelopmentalTimeline.module.css';
export const DevelopmentalTimeline = () => {
    const [milestones, setMilestones] = useState({
        communication: [
            {
                id: 1,
                milestone: "Babbling",
                expectedAge: 6,
                actualAge: null,
                significance: "Early vocal development",
                impact: "Foundation for verbal communication",
                category: "communication"
            },
            {
                id: 2,
                milestone: "First words",
                expectedAge: 12,
                actualAge: null,
                significance: "Verbal language emergence",
                impact: "Beginning of expressive language",
                category: "communication"
            },
            {
                id: 3,
                milestone: "Two-word phrases",
                expectedAge: 24,
                actualAge: null,
                significance: "Sentence formation",
                impact: "Complex thought expression",
                category: "communication"
            },
            {
                id: 4,
                milestone: "Complex sentences",
                expectedAge: 36,
                actualAge: null,
                significance: "Advanced language",
                impact: "Full communication ability",
                category: "communication"
            }
        ],
        socialEmotional: [
            {
                id: 5,
                milestone: "Social smile",
                expectedAge: 2,
                actualAge: null,
                significance: "Social engagement",
                impact: "Early social connection",
                category: "socialEmotional"
            },
            {
                id: 6,
                milestone: "Joint attention",
                expectedAge: 9,
                actualAge: null,
                significance: "Shared focus",
                impact: "Social learning foundation",
                category: "socialEmotional"
            },
            {
                id: 7,
                milestone: "Symbolic play",
                expectedAge: 18,
                actualAge: null,
                significance: "Imaginative capacity",
                impact: "Cognitive development",
                category: "socialEmotional"
            },
            {
                id: 8,
                milestone: "Peer interaction",
                expectedAge: 36,
                actualAge: null,
                significance: "Social relationships",
                impact: "Social skill development",
                category: "socialEmotional"
            }
        ],
        motorSkills: [
            {
                id: 9,
                milestone: "Head control",
                expectedAge: 3,
                actualAge: null,
                significance: "Core strength",
                impact: "Physical development foundation",
                category: "motorSkills"
            },
            {
                id: 10,
                milestone: "Rolling over",
                expectedAge: 6,
                actualAge: null,
                significance: "Gross motor control",
                impact: "Movement initiation",
                category: "motorSkills"
            },
            {
                id: 11,
                milestone: "Independent walking",
                expectedAge: 12,
                actualAge: null,
                significance: "Mobility",
                impact: "Environmental exploration",
                category: "motorSkills"
            },
            {
                id: 12,
                milestone: "Fine motor skills",
                expectedAge: 24,
                actualAge: null,
                significance: "Manual dexterity",
                impact: "Tool use and writing",
                category: "motorSkills"
            }
        ],
        cognitiveBehavioral: [
            {
                id: 13,
                milestone: "Object permanence",
                expectedAge: 8,
                actualAge: null,
                significance: "Memory development",
                impact: "Cognitive foundation",
                category: "cognitiveBehavioral"
            },
            {
                id: 14,
                milestone: "Following instructions",
                expectedAge: 18,
                actualAge: null,
                significance: "Comprehension",
                impact: "Learning ability",
                category: "cognitiveBehavioral"
            },
            {
                id: 15,
                milestone: "Problem solving",
                expectedAge: 30,
                actualAge: null,
                significance: "Critical thinking",
                impact: "Independent functioning",
                category: "cognitiveBehavioral"
            },
            {
                id: 16,
                milestone: "Abstract thinking",
                expectedAge: 48,
                actualAge: null,
                significance: "Complex cognition",
                impact: "Advanced reasoning",
                category: "cognitiveBehavioral"
            }
        ]
    });
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const handleDragStart = (e, category, id) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ category, id }));
    };
    const handleDrop = (e, monthPoint) => {
        e.preventDefault();
        const { category, id } = JSON.parse(e.dataTransfer.getData('text/plain'));
        setMilestones(prev => ({
            ...prev,
            [category]: prev[category].map(m => m.id === id ? { ...m, actualAge: monthPoint } : m)
        }));
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const getMilestoneStatus = (milestone) => {
        if (milestone.actualAge === null)
            return 'pending';
        const diff = milestone.actualAge - milestone.expectedAge;
        if (diff <= 3)
            return 'typical';
        if (diff <= 6)
            return 'monitor';
        return 'delayed';
    };
    const TimelineGrid = () => {
        const months = Array.from({ length: 48 }, (_, i) => i);
        return (_jsx("div", { className: styles.timelineGrid, children: _jsx("div", { className: styles.gridContainer, children: months.map(month => (_jsxs("div", { className: styles.monthMarker, onDragOver: handleDragOver, onDrop: (e) => handleDrop(e, month), children: [month % 12 === 0 && (_jsxs("span", { className: `${styles.monthLabel} ${styles.year}`, children: [month / 12, "y"] })), month % 6 === 0 && month % 12 !== 0 && (_jsxs("span", { className: styles.monthLabel, children: [month, "m"] }))] }, month))) }) }));
    };
    const MilestoneDetails = ({ milestone }) => (_jsxs("div", { className: styles.milestoneDetails, children: [_jsx("h4", { className: styles.detailsTitle, children: milestone.milestone }), _jsxs("div", { className: styles.detailsContent, children: [_jsxs("p", { children: [_jsx("span", { className: styles.detailsLabel, children: "Expected:" }), " ", milestone.expectedAge, " months"] }), milestone.actualAge !== null && (_jsxs("p", { children: [_jsx("span", { className: styles.detailsLabel, children: "Observed:" }), " ", milestone.actualAge, " months"] })), _jsxs("p", { children: [_jsx("span", { className: styles.detailsLabel, children: "Significance:" }), " ", milestone.significance] }), _jsxs("p", { children: [_jsx("span", { className: styles.detailsLabel, children: "Clinical Impact:" }), " ", milestone.impact] }), _jsxs("p", { children: [_jsx("span", { className: styles.detailsLabel, children: "Status: " }), _jsx("span", { className: `${styles.status} ${styles[getMilestoneStatus(milestone)]}`, children: getMilestoneStatus(milestone) })] })] })] }));
    return (_jsxs("div", { className: styles.timeline, children: [Object.entries(milestones).map(([category, items]) => (_jsxs("div", { className: styles.milestoneContainer, children: [_jsx("h3", { className: styles.categoryTitle, children: category.replace(/([A-Z])/g, ' $1').trim() }), items.map(milestone => (_jsxs("div", { className: styles.milestone, draggable: true, onDragStart: (e) => handleDragStart(e, category, milestone.id), onClick: () => {
                            setSelectedMilestone(milestone);
                            setShowDetails(true);
                        }, children: [_jsx("span", { className: styles.milestoneTitle, children: milestone.milestone }), milestone.actualAge !== null && (_jsxs("span", { className: `${styles.status} ${styles[getMilestoneStatus(milestone)]}`, children: [milestone.actualAge, "m"] }))] }, milestone.id))), selectedMilestone?.category === category && showDetails && (_jsx(MilestoneDetails, { milestone: selectedMilestone }))] }, category))), _jsx(TimelineGrid, {})] }));
};
