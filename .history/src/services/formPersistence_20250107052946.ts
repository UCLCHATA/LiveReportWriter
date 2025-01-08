interface StoredForm {
  chataId: string;
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
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
}

export class FormPersistenceService {
  private readonly STORAGE_KEY = 'chata-forms';

  private createDefaultFormState() {
    return {
      status: 'draft' as const,
      ascStatus: '',
      adhdStatus: '',
      referrals: {
        speech: false,
        educational: false,
        sleep: false,
        occupational: false,
        mental: false,
        other: false
      },
      remarks: '',
      clinicalObservations: '',
      priorityAreas: '',
      strengths: '',
      recommendations: '',
      differentialDiagnosis: ''
    };
  }

  private getStoredForms(): Record<string, StoredForm> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      console.log('[FormPersistence] All stored forms:', stored);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[FormPersistence] Error reading stored forms:', error);
      return {};
    }
  }

  private setStoredForms(forms: Record<string, StoredForm>) {
    try {
      console.log('[FormPersistence] Setting forms in storage:', forms);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(forms));
    } catch (error) {
      console.error('[FormPersistence] Error storing forms:', error);
    }
  }

  saveForm(form: StoredForm) {
    console.log('[FormPersistence] Saving form:', {
      chataId: form.chataId,
      hasClinicianInfo: !!form.clinicianInfo,
      hasFormState: !!form.formState,
      hasAssessmentState: !!form.assessmentState
    });

    const forms = this.getStoredForms();
    forms[form.chataId] = {
      ...forms[form.chataId], // Preserve existing data
      ...form, // Merge new data
      formState: {
        ...this.createDefaultFormState(),
        ...form.formState
      },
      lastUpdated: Date.now()
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

    console.log('[FormPersistence] Found form:', {
      chataId: form.chataId,
      hasClinicianInfo: !!form.clinicianInfo,
      hasFormState: !!form.formState,
      hasAssessmentState: !!form.assessmentState
    });
    return form;
  }

  updateFormState(chataId: string, formState: StoredForm['formState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        formState,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('[FormPersistence] Updated form state for:', chataId);
    }
  }

  updateAssessmentState(chataId: string, assessmentState: StoredForm['assessmentState']): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        assessmentState: {
          ...forms[chataId].assessmentState,
          ...assessmentState
        },
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('[FormPersistence] Updated assessment state for:', chataId);
    }
  }

  getFormByClinicianEmail(email: string): StoredForm | null {
    const forms = this.getStoredForms();
    return Object.values(forms).find(
      form => form.clinicianInfo.email === email && !form.isSubmitted
    ) || null;
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
      console.log('[FormPersistence] Marked form as submitted:', chataId);
    }
  }
}

export const formPersistence = new FormPersistenceService(); 