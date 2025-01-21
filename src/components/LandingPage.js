import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './LandingPage.module.css';
export const LandingPage = ({ onCreateReport }) => {
    const handleDownloadTemplate = () => {
        window.open('https://docs.google.com/document/d/1FrB47q-LB5T5z1F3sk-j84bwoPM90LOvrN8CJzdwBPQ/edit?tab=t.0#heading=h.gjdgxs', '_blank');
    };
    return (_jsx("div", { className: styles.container, children: _jsxs("div", { className: styles.buttonContainer, children: [_jsx("button", { className: styles.createButton, onClick: onCreateReport, children: "Create Report" }), _jsx("button", { className: styles.downloadButton, onClick: handleDownloadTemplate, children: "Download Template" })] }) }));
};
