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
    console.log('Retrieved from storage:', stored);
    return stored ? JSON.parse(stored) : {};
  }

  private setStoredForms(forms: Record<string, StoredForm>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(forms));
  }

  saveForm(form: StoredForm) {
    const forms = this.getStoredForms();
    forms[form.chataId] = form;
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
}

export const formPersistence = new FormPersistenceService(); 