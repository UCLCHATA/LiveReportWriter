import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Footer.module.css';
import uclLogo from '../assets/ucl-logo.png';
import nhsLogo from '../assets/nhs-logo.png';
console.log('Imported NHS Logo:', nhsLogo);
export const Footer = () => {
    const handleNHSLogoError = (e) => {
        console.error('NHS Logo failed to load:', e);
        const img = e.target;
        console.log('NHS Logo src:', img.src);
    };
    return (_jsx("footer", { className: styles.footer, children: _jsxs("div", { className: styles.footerContent, children: [_jsxs("div", { className: styles.footerLogos, children: [_jsx("img", { src: uclLogo, alt: "UCL Logo", className: `${styles.footerLogo} ${styles.uclLogo}` }), _jsx("img", { src: nhsLogo, alt: "NHS Logo", className: `${styles.footerLogo} ${styles.nhsLogo}`, onError: handleNHSLogoError })] }), _jsxs("div", { className: styles.footerText, children: [_jsx("p", { children: "\u00A9 2024 UCL & NHS. All rights reserved." }), _jsx("p", { className: styles.contactText, children: "For support, please contact uclchata@gmail.com" })] })] }) }));
};
