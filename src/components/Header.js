import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';
import { debounce } from 'lodash';
export const Header = ({ chataId, progress = 0, isChataIdDialogOpen = false }) => {
    const [milestone, setMilestone] = React.useState(null);
    const [displayProgress, setDisplayProgress] = React.useState(Math.round(progress));
    const getProgressState = (progress) => {
        if (progress >= 95)
            return 'complete';
        if (progress >= 70)
            return 'high';
        if (progress >= 40)
            return 'medium';
        return 'low';
    };
    // Update display progress with debounce
    React.useEffect(() => {
        const debouncedUpdate = debounce((newProgress) => {
            setDisplayProgress(Math.round(newProgress));
        }, 300);
        debouncedUpdate(progress);
        return () => debouncedUpdate.cancel();
    }, [progress]);
    // Handle milestone detection
    React.useEffect(() => {
        const milestones = [25, 50, 75, 100];
        const currentMilestone = milestones.find(m => displayProgress >= m && displayProgress < m + 5);
        if (currentMilestone) {
            setMilestone(currentMilestone);
            // Reset milestone after animation
            const timer = setTimeout(() => {
                setMilestone(null);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [displayProgress]);
    return (_jsx("header", { className: styles.siteHeader, children: _jsxs("div", { className: styles.headerContent, children: [_jsx("div", { className: `${styles.logoContainer} ${styles.left}`, children: _jsx("img", { className: `${styles.headerLogo} ${styles.ucl}`, src: "https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png", alt: "UCL Logo" }) }), _jsxs("div", { className: styles.centerContent, children: [_jsxs(motion.h1, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: ["CHATA", ' ', _jsx(motion.span, { className: styles.liveText, initial: { color: '#4f46e5' }, animate: { color: '#6366f1' }, transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }, children: "Live" }), ' ', "Autism Report Generator"] }), _jsxs("div", { className: styles.metricsContainer, children: [_jsx("div", { className: styles.progressContainer, children: _jsx("div", { className: styles.progressBar, style: { width: `${displayProgress}%` }, "data-progress": getProgressState(displayProgress), "data-milestone": milestone, children: _jsxs("span", { className: styles.progressText, children: [displayProgress, "%"] }) }) }), chataId && (_jsxs("div", { className: `${styles.chataIdDisplay} ${isChataIdDialogOpen ? styles.pulsing : ''}`, children: [_jsx("span", { className: styles.chataIdLabel, children: "CHATA ID:" }), _jsx("span", { className: styles.chataIdValue, children: chataId })] }))] })] }), _jsx("div", { className: `${styles.logoContainer} ${styles.right}`, children: _jsx("img", { className: styles.headerLogo, src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png", alt: "NHS Logo" }) })] }) }));
};
