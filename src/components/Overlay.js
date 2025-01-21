import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Overlay.module.css';
export const Overlay = ({ onCreateReport }) => {
    return (_jsx("div", { className: styles.overlay, children: _jsx("button", { className: styles.createReportButton, onClick: onCreateReport, children: "Create Report" }) }));
};
