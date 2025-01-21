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
      }
    });

    // Save the new form
    forms[form.chataId] = {
      ...form,
      lastUpdated: Date.now()
    };

    // Save form state to separate storage
    if (form.formState) {
      localStorage.setItem(`chata-form-state-${form.chataId}`, JSON.stringify(form.formState));
    }
    
    // Save assessment state to separate storage
    if (form.assessmentState) {
      localStorage.setItem(`chata_assessments_${form.chataId}`, JSON.stringify(form.assessmentState));
    }

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

    // Get detailed form state
    const formState = localStorage.getItem(`chata-form-state-${chataId}`);
    if (formState) {
      form.formState = JSON.parse(formState);
    }

    // Get assessment state
    const assessmentState = localStorage.getItem(`chata_assessments_${chataId}`);
    if (assessmentState) {
      form.assessmentState = JSON.parse(assessmentState);
    }

    return form;
  }

  // ... rest of the code ...
} 