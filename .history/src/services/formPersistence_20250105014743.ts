type FormData = {
  chataId: string;
  clinicianInfo: {
    name: string;
    email: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  lastUpdated: number;
  isSubmitted: boolean;
};

const STORAGE_KEY = 'r3_assessment_forms';

class FormPersistenceService {
  private getStoredForms(): Record<string, FormData> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private setStoredForms(forms: Record<string, FormData>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }

  saveForm(data: FormData): void {
    const forms = this.getStoredForms();
    forms[data.chataId] = {
      ...data,
      lastUpdated: Date.now()
    };
    this.setStoredForms(forms);
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

  markAsSubmitted(chataId: string): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId].isSubmitted = true;
      this.setStoredForms(forms);
    }
  }

  getAllUnsubmittedForms(): FormData[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => !form.isSubmitted);
  }

  cleanupOldForms(maxAgeDays: number = 30): void {
    const forms = this.getStoredForms();
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

    const cleanedForms = Object.entries(forms).reduce((acc, [id, form]) => {
      if (now - form.lastUpdated < maxAge) {
        acc[id] = form;
      }
      return acc;
    }, {} as Record<string, FormData>);

    this.setStoredForms(cleanedForms);
  }
}

export const formPersistence = new FormPersistenceService(); 