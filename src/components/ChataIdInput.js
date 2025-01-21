import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import styles from './ClinicianModal.module.css';
export const ChataIdInput = ({ onChange, onSubmit }) => {
    const [segments, setSegments] = useState(['', '', '']); // [clinicianCode, childCode, number]
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null)
    ];
    const handleSegmentChange = (index, value) => {
        const newValue = value.toUpperCase();
        const newSegments = [...segments];
        newSegments[index] = newValue;
        setSegments(newSegments);
        // Combine segments with hyphens
        const fullChataId = newSegments.join('-');
        onChange(fullChataId);
        // Auto-advance to next segment
        if (index < 2 && newValue.length === 3) {
            inputRefs[index + 1].current?.focus();
        }
        // Auto-submit if complete
        if (index === 2 && newValue.length === 3 &&
            segments[0].length === 3 && segments[1].length === 3) {
            onSubmit();
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !segments[index] && index > 0) {
            // Move to previous segment on backspace if current segment is empty
            inputRefs[index - 1].current?.focus();
        }
    };
    return (_jsxs("div", { className: styles.segmentedInput, children: [_jsx("input", { ref: inputRefs[0], type: "text", maxLength: 3, value: segments[0], onChange: (e) => handleSegmentChange(0, e.target.value), onKeyDown: (e) => handleKeyDown(0, e), placeholder: "KOS", className: styles.segment }), _jsx("span", { className: styles.separator, children: "-" }), _jsx("input", { ref: inputRefs[1], type: "text", maxLength: 3, value: segments[1], onChange: (e) => handleSegmentChange(1, e.target.value), onKeyDown: (e) => handleKeyDown(1, e), placeholder: "JOH", className: styles.segment }), _jsx("span", { className: styles.separator, children: "-" }), _jsx("input", { ref: inputRefs[2], type: "text", maxLength: 3, value: segments[2], onChange: (e) => handleSegmentChange(2, e.target.value), onKeyDown: (e) => handleKeyDown(2, e), placeholder: "123", className: styles.segment })] }));
};
