import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './ChataIdDisplay.module.css';
export const ChataIdDisplay = ({ chataId, isBlinking = false }) => {
    if (!chataId)
        return null;
    return (_jsxs("div", { className: `${styles.container} ${isBlinking ? styles.blinking : ''}`, children: [_jsx("span", { className: styles.label, children: "CHATA ID:" }), _jsx("span", { className: styles.id, children: chataId })] }));
};
