import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './SubmissionOverlay.module.css';
import { X } from 'lucide-react';
export const SubmissionOverlay = ({ isVisible, currentStage, progress, details, onClose }) => {
    if (!isVisible)
        return null;
    const getStageMessage = (stage) => {
        switch (stage) {
            case 'submission':
                return 'Submitting form data...';
            case 'waiting':
                return 'Waiting for data sync...';
            case 'complete':
                return 'Form submitted successfully! You will receive an email once the report is ready.';
            case 'error':
                return 'An error occurred during submission. Please try again.';
            default:
                return '';
        }
    };
    return (_jsx("div", { className: styles.overlay, children: _jsxs("div", { className: styles.content, children: [onClose && (_jsx("button", { className: styles.closeButton, onClick: onClose, children: _jsx(X, { size: 24 }) })), _jsx("div", { className: styles.progressBar, children: _jsx("div", { className: styles.progressFill, style: { width: `${progress}%` } }) }), _jsx("div", { className: styles.stage, children: getStageMessage(currentStage) }), currentStage === 'error' && onClose && (_jsx("button", { className: styles.retryButton, onClick: onClose, children: "Close" }))] }) }));
};
