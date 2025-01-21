// API endpoints
export const R3_FORM_API = process.env.REACT_APP_R3_FORM_API || '/api/r3-form';

// Apps Script URLs
export const APPS_SCRIPT_URLS = {
  template: process.env.REACT_APP_TEMPLATE_SCRIPT_URL || '/api/template',
  analysis: process.env.REACT_APP_ANALYSIS_SCRIPT_URL || '/api/analysis',
  report: process.env.REACT_APP_REPORT_SCRIPT_URL || '/api/report'
} as const; 