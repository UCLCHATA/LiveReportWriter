// API endpoints
export const R3_FORM_API = import.meta.env.VITE_R3_FORM_API || '/api/r3-form';
// Apps Script URLs
export const APPS_SCRIPT_URLS = {
    template: import.meta.env.VITE_TEMPLATE_SCRIPT_URL || '/api/template',
    analysis: import.meta.env.VITE_ANALYSIS_SCRIPT_URL || '/api/analysis',
    report: import.meta.env.VITE_REPORT_SCRIPT_URL || '/api/report'
};
