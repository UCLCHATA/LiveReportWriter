import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './BehavioralAssessment.module.css';
import carouselStyles from './AssessmentCarousel.module.css';
export const BehavioralAssessment = () => {
    const [timeline, setTimeline] = useState([
        {
            category: 'Social',
            milestones: [
                { label: 'Social smile', achieved: false, ageInMonths: 0 },
                { label: 'Stranger anxiety', achieved: false, ageInMonths: 0 },
                { label: 'Parallel play', achieved: false, ageInMonths: 0 },
            ],
        },
        {
            category: 'Motor',
            milestones: [
                { label: 'Rolling over', achieved: false, ageInMonths: 0 },
                { label: 'Crawling', achieved: false, ageInMonths: 0 },
                { label: 'Walking independently', achieved: false, ageInMonths: 0 },
            ],
        },
        {
            category: 'Communication',
            milestones: [
                { label: 'First words', achieved: false, ageInMonths: 0 },
                { label: 'Two-word phrases', achieved: false, ageInMonths: 0 },
                { label: 'Complex sentences', achieved: false, ageInMonths: 0 },
            ],
        },
    ]);
    const handleMilestoneChange = (categoryIndex, milestoneIndex, achieved, ageInMonths) => {
        const newTimeline = [...timeline];
        newTimeline[categoryIndex].milestones[milestoneIndex] = {
            ...newTimeline[categoryIndex].milestones[milestoneIndex],
            achieved,
            ageInMonths,
        };
        setTimeline(newTimeline);
    };
    return (_jsxs("div", { className: carouselStyles.carouselContainer, children: [_jsxs("header", { className: carouselStyles.carouselHeader, children: [_jsx("button", { className: carouselStyles.navButton, children: _jsx("span", { children: "\u2190" }) }), _jsxs("div", { className: carouselStyles.titleSection, children: [_jsx("h2", { className: carouselStyles.title, children: "Behavioral Assessment" }), _jsxs("button", { className: carouselStyles.toolkitButton, children: [_jsx("span", { children: "\u2139\uFE0F" }), _jsx("span", { children: "Toolkit" })] })] }), _jsx("div", { className: carouselStyles.carouselIndicators, children: [1, 2, 3].map((_, index) => (_jsx("div", { className: `${carouselStyles.indicator} ${index === 0 ? carouselStyles.indicatorActive : ''}` }, index))) }), _jsx("button", { className: carouselStyles.navButton, children: _jsx("span", { children: "\u2192" }) })] }), _jsx("div", { className: carouselStyles.carouselContent, children: timeline.map((category, categoryIndex) => (_jsxs("div", { className: styles.timelineContainer, children: [_jsx("h3", { children: category.category }), category.milestones.map((milestone, milestoneIndex) => (_jsxs("div", { className: styles.timelineRow, children: [_jsx("div", { className: styles.timelineLabel, children: milestone.label }), _jsxs("div", { className: styles.timelineTrack, children: [_jsx("input", { type: "checkbox", checked: milestone.achieved, onChange: (e) => handleMilestoneChange(categoryIndex, milestoneIndex, e.target.checked, milestone.ageInMonths) }), _jsx("input", { type: "number", value: milestone.ageInMonths, onChange: (e) => handleMilestoneChange(categoryIndex, milestoneIndex, milestone.achieved, Number(e.target.value)), placeholder: "Age in months", min: "0", max: "36" })] })] }, milestone.label)))] }, category.category))) })] }));
};
