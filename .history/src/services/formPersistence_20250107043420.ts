interface StoredForm {
  chataId: string;
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName: string;
    childAge?: string;
    childGender?: string;
  };
  lastUpdated?: number;
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
}

export class FormPersistenceService {
  private readonly STORAGE_KEY = 'chata-forms';

  private getStoredForms(): Record<string, StoredForm> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    console.log('[FormPersistence] All stored forms:', stored);
    return stored ? JSON.parse(stored) : {};
  }

  private setStoredForms(forms: Record<string, StoredForm>) {
    console.log('[FormPersistence] Setting forms in storage:', forms);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(forms));
  }

  saveForm(form: StoredForm) {
    console.log('[FormPersistence] Saving form:', {
      chataId: form.chataId,
      hasClinicianInfo: !!form.clinicianInfo,
      hasFormState: !!form.formState,
      hasAssessmentState: !!form.assessmentState,
      formState: form.formState
    });

    const forms = this.getStoredForms();
    forms[form.chataId] = {
      ...forms[form.chataId], // Preserve existing data
      ...form, // Merge new data
      lastUpdated: Date.now() // Add timestamp
    };
    this.setStoredForms(forms);
  }

  getForm(chataId: string): StoredForm | null {
    console.log('[FormPersistence] Getting form for CHATA ID:', chataId);
    const forms = this.getStoredForms();
    const form = forms[chataId];
    
    if (!form) {
      console.log('[FormPersistence] No form found for CHATA ID:', chataId);
      return null;
    }

    // Ensure assessment state is properly initialized
    if (!form.assessmentState) {
      form.assessmentState = {
        sensoryProfile: null,
        socialCommunication: null,
        behaviorInterests: null,
        milestones: null,
        assessmentLog: null
      };
    }

    console.log('[FormPersistence] Found form:', {
      chataId: form.chataId,
      hasClinicianInfo: !!form.clinicianInfo,
      hasFormState: !!form.formState,
      hasAssessmentState: !!form.assessmentState,
      formState: form.formState
    });
    return form;
  }

  updateFormState(chataId: string, formState: StoredForm['formState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        formState
      };
      this.setStoredForms(forms);
      console.log('Updated form state for:', chataId);
    }
  }

  updateAssessmentState(chataId: string, assessmentState: StoredForm['assessmentState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        assessmentState
      };
      this.setStoredForms(forms);
      console.log('Updated assessment state for:', chataId);
    }
  }

  getAllUnsubmittedForms(): StoredForm[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => !form.isSubmitted);
  }

  markAsSubmitted(chataId: string): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        isSubmitted: true,
        formState: forms[chataId].formState ? {
          ...forms[chataId].formState,
          status: 'submitted'
        } : undefined
      };
      this.setStoredForms(forms);
      console.log('Marked form as submitted:', chataId);
    }
  }
}

export const formPersistence = new FormPersistenceService(); 