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
}

export class FormPersistenceService {
  private readonly STORAGE_KEY = 'chata-forms';

  private getStoredForms(): Record<string, StoredForm> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    console.log('Retrieved from storage:', stored);
    return stored ? JSON.parse(stored) : {};
  }

  private setStoredForms(forms: Record<string, StoredForm>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(forms));
  }

  saveForm(form: StoredForm) {
    const forms = this.getStoredForms();
    
    // Clean up old forms for this clinician/child combination
    const clinicianEmail = form.clinicianInfo.email.toLowerCase();
    const childName = form.clinicianInfo.childName.toLowerCase();
    
    Object.entries(forms).forEach(([chataId, existingForm]) => {
      if (chataId !== form.chataId && 
          existingForm.clinicianInfo.email.toLowerCase() === clinicianEmail &&
          existingForm.clinicianInfo.childName.toLowerCase() === childName &&
          !existingForm.isSubmitted) {
        console.log('Cleaning up old form:', chataId);
        delete forms[chataId];
        // Clean up associated storage
        localStorage.removeItem(`chata-form-state-${chataId}`);
        localStorage.removeItem(`chata_assessments_${chataId}`);
      }
    });

    // Save everything in a single operation
    const completeForm = {
      ...form,
      lastUpdated: Date.now()
    };
    forms[form.chataId] = completeForm;
    
    // Save all data in one place
    this.setStoredForms(forms);
    console.log('Saved form:', form.chataId);
  }

  getForm(chataId: string): StoredForm | null {
    console.log('Getting form for CHATA ID:', chataId);
    const forms = this.getStoredForms();
    const form = forms[chataId];
    
    if (!form) {
      console.log('No form found for CHATA ID:', chataId);
      return null;
    }

    console.log('Found form:', form);
    return form;
  }

  getFormByClinicianEmail(email: string): StoredForm | null {
    const forms = this.getStoredForms();
    return Object.values(forms).find(
      form => form.clinicianInfo.email.toLowerCase() === email.toLowerCase() && !form.isSubmitted
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
      console.log('Marked form as submitted:', chataId);
    }
  }

  getAllUnsubmittedForms(): StoredForm[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => !form.isSubmitted);
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
      console.log('Updated form state for:', chataId);
    }
  }

  updateAssessmentState(chataId: string, assessmentState: StoredForm['assessmentState']): void {
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

  cleanupOldForms(maxAgeDays: number = 30): void {
    const forms = this.getStoredForms();
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

    const cleanedForms = Object.entries(forms).reduce((acc, [id, form]) => {
      if (now - form.lastUpdated < maxAge) {
        acc[id] = form;
      }
      return acc;
    }, {} as Record<string, StoredForm>);

    this.setStoredForms(cleanedForms);
  }
}

export const formPersistence = new FormPersistenceService(); 