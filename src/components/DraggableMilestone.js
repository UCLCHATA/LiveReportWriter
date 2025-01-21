import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import styles from './MilestoneTracker.module.css';
export const DraggableMilestone = ({ milestone, category, onCustomConcern }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: milestone.id,
        data: {
            type: 'milestone',
            milestone,
            category,
        },
        disabled: milestone.id === 'custom-concern'
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
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
    const isEarly = milestone.actualAge !== undefined &&
        milestone.expectedAge !== 0 &&
        milestone.actualAge < milestone.expectedAge;
    const tooltipText = milestone.actualAge !== undefined
        ? `Placed at: ${milestone.actualAge}m${milestone.expectedAge ? ` (Expected: ${milestone.expectedAge}m)` : ''}${differenceText ? ` - ${isDelayed ? 'Delayed' : 'Advanced'} by ${Math.abs(milestone.actualAge - milestone.expectedAge)}m` : ''}`
        : '';
    return (_jsxs(motion.div, { ref: setNodeRef, style: style, className: `${styles.milestone} ${milestone.actualAge !== undefined ? styles.placedMilestone : ''}`, "data-category": category, "data-milestone-id": milestone.id, "data-early": isEarly, "data-tooltip": tooltipText, ...attributes, ...listeners, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), children: [milestone.title, milestone.actualAge !== undefined && milestone.expectedAge !== 0 && (_jsx("div", { className: styles.monthCircle, "data-delayed": isDelayed, "data-early": !isDelayed, children: _jsx("span", { className: `${styles.monthText} ${isHovered ? styles.showDifference : ''}`, children: isHovered && differenceText ? differenceText : `${milestone.actualAge}m` }) }))] }));
};
