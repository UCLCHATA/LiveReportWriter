import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Select = ({ options, value, onChange, label, error, className = '', disabled, ...props }) => {
    const baseStyles = 'w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';
    const errorStyles = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
    const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsx("select", { value: value, onChange: (e) => onChange(e.target.value), disabled: disabled, className: `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`, ...props, children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), error && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: error }))] }));
};
