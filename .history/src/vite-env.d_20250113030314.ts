/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_R3_FORM_API: string
  readonly VITE_TEMPLATE_SCRIPT_URL: string
  readonly VITE_ANALYSIS_SCRIPT_URL: string
  readonly VITE_REPORT_SCRIPT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 