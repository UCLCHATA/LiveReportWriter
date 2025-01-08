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
  lastUpdated: number;
  isSubmitted: boolean;
  formState?: {
    status: 'draft' | 'submitted';
    ascStatus: string;
    adhdStatus: string;
    referrals: {
      speech: boolean;
      educational: boolean;
      sleep: boolean;
      occupational: boolean;
      mental: boolean;
      other: boolean;
    };
    remarks: string;
    clinicalObservations: string;
    priorityAreas: string;
    strengths: string;
    recommendations: string;
    differentialDiagnosis?: string;
  };
  assessmentState?: {
    sensoryProfile?: any;
    socialCommunication?: any;
    behaviorInterests?: any;
    milestones?: any;
    assessmentLog?: any;
  };
  progress?: {
    formProgress: number;
    carouselProgress: number;
  };
};

const STORAGE_KEY = 'r3_assessment_forms';

class FormPersistenceService {
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
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Retrieved from storage:', stored);
    return stored ? JSON.parse(stored) : {};
  }

  private setStoredForms(forms: Record<string, FormData>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }

  saveForm(data: FormData): void {
    console.log('Saving form:', data);
    const forms = this.getStoredForms();
    forms[data.chataId] = {
      ...forms[data.chataId],  // Preserve existing data
      ...data,
      lastUpdated: Date.now()
    };
    console.log('Updated forms:', forms);
    this.setStoredForms(forms);
  }

  updateFormState(chataId: string, formState: FormData['formState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        formState,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('Updated form state for:', chataId);
    }
  }

  updateAssessmentState(chataId: string, assessmentState: FormData['assessmentState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        assessmentState,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('Updated assessment state for:', chataId);
    }
  }

  updateProgress(chataId: string, progress: FormData['progress']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        progress,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('Updated progress for:', chataId);
    }
  }

  getForm(chataId: string): FormData | null {
    console.log('Getting form for CHATA ID:', chataId);
    const forms = this.getStoredForms();
    const form = forms[chataId] || null;
    console.log('Found form:', form);
    return form;
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
      if (forms[chataId].formState) {
        forms[chataId].formState.status = 'submitted';
      }
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