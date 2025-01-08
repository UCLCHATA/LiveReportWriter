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
  formState: {
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
  };
  assessments: {
    sensoryProfile: any | null;
    socialCommunication: any | null;
    behaviorInterests: any | null;
    milestones: any | null;
    assessmentLog: any | null;
  };
  lastUpdated: number;
  isSubmitted: boolean;
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
    } catch (error) {
      console.error('Error storing forms:', error);
    }
  }

  saveForm(data: FormData): void {
    try {
      const forms = this.getStoredForms();
      forms[data.chataId] = {
        ...data,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
      console.log('Form saved successfully:', { chataId: data.chataId });
    } catch (error) {
      console.error('Error saving form:', error);
    }
  }

  getForm(chataId: string): FormData | null {
    try {
      const forms = this.getStoredForms();
      const form = forms[chataId];
      if (form) {
        console.log('Form retrieved successfully:', { chataId });
        return form;
      }
      console.log('No form found for CHATA ID:', { chataId });
      return null;
    } catch (error) {
      console.error('Error retrieving form:', error);
      return null;
    }
  }

  getFormByClinicianEmail(email: string): FormData | null {
    try {
      const forms = this.getStoredForms();
      const form = Object.values(forms).find(
        form => form.clinicianInfo.email.toLowerCase() === email.toLowerCase() && !form.isSubmitted
      );
      if (form) {
        console.log('Form found for email:', { email, chataId: form.chataId });
        return form;
      }
      console.log('No form found for email:', { email });
      return null;
    } catch (error) {
      console.error('Error retrieving form by email:', error);
      return null;
    }
  }

  markAsSubmitted(chataId: string): void {
    try {
      const forms = this.getStoredForms();
      if (forms[chataId]) {
        forms[chataId].isSubmitted = true;
        forms[chataId].formState.status = 'submitted';
        forms[chataId].lastUpdated = Date.now();
        this.setStoredForms(forms);
        console.log('Form marked as submitted:', { chataId });
      }
    } catch (error) {
      console.error('Error marking form as submitted:', error);
    }
  }

  getAllUnsubmittedForms(): FormData[] {
    try {
      const forms = this.getStoredForms();
      const unsubmitted = Object.values(forms).filter(form => !form.isSubmitted);
      console.log('Retrieved unsubmitted forms:', { count: unsubmitted.length });
      return unsubmitted;
    } catch (error) {
      console.error('Error retrieving unsubmitted forms:', error);
      return [];
    }
  }

  updateFormState(chataId: string, formState: Partial<FormData['formState']>): void {
    try {
      const forms = this.getStoredForms();
      if (forms[chataId]) {
        forms[chataId].formState = {
          ...forms[chataId].formState,
          ...formState
        };
        forms[chataId].lastUpdated = Date.now();
        this.setStoredForms(forms);
        console.log('Form state updated:', { chataId });
      }
    } catch (error) {
      console.error('Error updating form state:', error);
    }
  }

  updateAssessments(chataId: string, assessments: Partial<FormData['assessments']>): void {
    try {
      const forms = this.getStoredForms();
      if (forms[chataId]) {
        forms[chataId].assessments = {
          ...forms[chataId].assessments,
          ...assessments
        };
        forms[chataId].lastUpdated = Date.now();
        this.setStoredForms(forms);
        console.log('Assessments updated:', { chataId });
      }
    } catch (error) {
      console.error('Error updating assessments:', error);
    }
  }

  deleteForm(chataId: string): void {
    try {
      const forms = this.getStoredForms();
      if (forms[chataId]) {
        delete forms[chataId];
        this.setStoredForms(forms);
        console.log('Form deleted:', { chataId });
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  }
}

export const formPersistence = new FormPersistenceService(); 