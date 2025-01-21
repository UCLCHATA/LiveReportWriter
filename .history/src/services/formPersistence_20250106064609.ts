type FormField = {
  value: string;
  lastUpdated: number;
};

type FormSection = {
  clinical: FormField;
  strengths: FormField;
  priority: FormField;
  support: FormField;
  asc_status: FormField;
  adhd_status: FormField;
  referrals: string[];
};

type FormData = {
  chataId: string;
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  formContent: FormSection;
  lastUpdated: number;
  isSubmitted: boolean;
  isDraft: boolean;
};

const STORAGE_KEY = 'r3_assessment_forms';
const AUTO_SAVE_DELAY = 1000; // 1 second

class FormPersistenceService {
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: FormData | null) => void> = new Set();

  constructor() {
    // Load existing IDs on initialization
    const forms = this.getStoredForms();
    const existingIds = Object.keys(forms);
    if (existingIds.length > 0) {
      import('../utils/chataId').then(({ loadExistingIds }) => {
        loadExistingIds(existingIds);
      });
    }
  }

  private getStoredForms(): Record<string, FormData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored forms:', error);
      return {};
    }
  }

  private setStoredForms(forms: Record<string, FormData>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
      this.notifySubscribers(forms[Object.keys(forms)[0]] || null);
    } catch (error) {
      console.error('Error storing forms:', error);
    }
  }

  // Subscribe to form changes
  subscribe(callback: (data: FormData | null) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(data: FormData | null): void {
    this.subscribers.forEach(callback => callback(data));
  }

  // Auto-save mechanism
  private scheduleAutoSave(data: FormData): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveForm(data);
    }, AUTO_SAVE_DELAY);
  }

  // Save form with auto-save support
  saveForm(data: FormData, immediate = false): void {
    if (immediate) {
      const forms = this.getStoredForms();
      forms[data.chataId] = {
        ...data,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
    } else {
      this.scheduleAutoSave(data);
    }
  }

  // Update specific form field
  updateFormField(chataId: string, field: keyof FormSection, value: string): void {
    const forms = this.getStoredForms();
    const form = forms[chataId];
    
    if (form) {
      forms[chataId] = {
        ...form,
        formContent: {
          ...form.formContent,
          [field]: {
            value,
            lastUpdated: Date.now()
          }
        },
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
    }
  }

  getForm(chataId: string): FormData | null {
    const forms = this.getStoredForms();
    return forms[chataId] || null;
  }

  getFormByClinicianEmail(email: string): FormData | null {
    const forms = this.getStoredForms();
    return Object.values(forms).find(
      form => form.clinicianInfo.email === email && !form.isSubmitted
    ) || null;
  }

  getDraftForms(): FormData[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => form.isDraft && !form.isSubmitted);
  }

  markAsSubmitted(chataId: string): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId].isSubmitted = true;
      forms[chataId].isDraft = false;
      forms[chataId].lastUpdated = Date.now();
      this.setStoredForms(forms);
    }
  }

  clearForm(chataId: string): void {
    const forms = this.getStoredForms();
    delete forms[chataId];
    this.setStoredForms(forms);
  }

  // Get form validation status
  validateForm(chataId: string): { isValid: boolean; errors: string[] } {
    const form = this.getForm(chataId);
    const errors: string[] = [];

    if (!form) {
      return { isValid: false, errors: ['Form not found'] };
    }

    // Check required fields
    if (!form.formContent.clinical.value) errors.push('Clinical observations required');
    if (!form.formContent.asc_status.value) errors.push('ASC status required');
    if (!form.formContent.adhd_status.value) errors.push('ADHD status required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const formPersistence = new FormPersistenceService(); 