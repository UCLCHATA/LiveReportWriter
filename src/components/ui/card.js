import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = '' }) => (_jsx("div", { className: `rounded-lg border shadow-sm p-4 ${className}`, children: children }));
export const CardHeader = ({ children, className = '' }) => (_jsx("div", { className: `flex items-center justify-between mb-4 ${className}`, children: children }));
export const CardContent = ({ children, className = '' }) => (_jsx("div", { className: className, children: children }));
