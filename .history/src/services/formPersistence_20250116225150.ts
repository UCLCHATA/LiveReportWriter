import { ClinicianInfo } from '../types/index';
import { debounce } from 'lodash';

type FormData = {
  chataId: string;
  clinicianInfo: ClinicianInfo;
  lastUpdated: number;
  isSubmitted: boolean;
  isDirty?: boolean;
  lastSavedAt?: number;
  version?: number;
  errorState?: {
    message: string;
    timestamp: number;
    recoveryAttempts: number;
  };
};

const STORAGE_KEY = 'r3_assessment_forms';
const BACKUP_KEY = 'r3_assessment_forms_backup';
const AUTO_SAVE_DELAY = 2000; // 2 seconds
const MAX_RECOVERY_ATTEMPTS = 3;

class FormPersistenceService {
  private autoSaveDebounced: ReturnType<typeof debounce>;
  private lastSaveAttempt: number = 0;
  private version: number = 1;
  private currentChataId: string | null = null;
  private readonly STORAGE_PREFIX = 'r3_form_';

  constructor() {
    this.autoSaveDebounced = debounce(this.performAutoSave.bind(this), AUTO_SAVE_DELAY);
    this.initializeService();
  }

  private initializeService() {
    // Get CHATA ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentChataId = urlParams.get('chataId');
    
    if (this.currentChataId) {
      console.log('Initializing form service for CHATA ID:', this.currentChataId);
    }
  }

  // Call this when creating a new form after clinician modal
  initializeNewForm(chataId: string): void {
    console.log('Initializing new form with CHATA ID:', chataId);
    
    // Instead of clearing all storage, only clear if there's a matching CHATA ID
    const existingForm = this.getForm(chataId);
    if (existingForm) {
      const key = this.getStorageKey(chataId);
      localStorage.removeItem(key);
    }
    
    // Set the new CHATA ID
    this.currentChataId = chataId;
    
    // Update URL with new CHATA ID
    const url = new URL(window.location.href);
    url.searchParams.set('chataId', chataId);
    window.history.replaceState({}, '', url.toString());
  }

  private clearAllStorage(): void {
    console.log('Clearing all form storage');
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        console.log('Removing storage:', key);
        localStorage.removeItem(key);
      }
    }
    
    // Clear backup
    localStorage.removeItem(BACKUP_KEY);
  }

  private getStorageKey(chataId: string): string {
    return `${this.STORAGE_PREFIX}${chataId}`;
  }

  private getStoredForm(): FormData | null {
    if (!this.currentChataId) {
      console.log('No current CHATA ID set');
      return null;
    }

    try {
      const key = this.getStorageKey(this.currentChataId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log('No stored form found for CHATA ID:', this.currentChataId);
        return null;
      }

      const form = JSON.parse(data);
      
      // Validate clinician info structure
      if (!form.clinicianInfo || !form.clinicianInfo.name || !form.clinicianInfo.email || !form.clinicianInfo.clinicName) {
        console.error('Invalid clinician info in stored form:', form);
        return null;
      }

      console.log('Retrieved form for CHATA ID:', {
        chataId: this.currentChataId,
        clinicianName: form.clinicianInfo.name,
        lastUpdated: new Date(form.lastUpdated).toISOString()
      });
      
      return form;
    } catch (error) {
      console.error('Error getting stored form:', error);
      return null;
    }
  }

  private setStoredForm(form: FormData): void {
    if (!this.currentChataId) {
      console.error('Cannot save form: No current CHATA ID');
      return;
    }

    try {
      const key = this.getStorageKey(this.currentChataId);
      localStorage.setItem(key, JSON.stringify(form));
      
      console.log('Saved form for CHATA ID:', {
        chataId: this.currentChataId,
        lastUpdated: new Date(form.lastUpdated).toISOString()
      });
    } catch (error) {
      console.error('Error saving form:', error);
    }
  }

  saveForm(form: FormData): void {
    if (!form.chataId) {
      console.error('Attempted to save form without CHATA ID');
      return;
    }

    // Ensure form.chataId matches currentChataId
    if (form.chataId !== this.currentChataId) {
      console.error('CHATA ID mismatch during save:', {
        formChataId: form.chataId,
        currentChataId: this.currentChataId
      });
      return;
    }

    // Validate clinician info before saving
    if (!form.clinicianInfo || !form.clinicianInfo.name || !form.clinicianInfo.email || !form.clinicianInfo.clinicName) {
      console.error('Invalid clinician info in form:', form);
      return;
    }

    // Update the form with current timestamp
    const updatedForm = {
      ...form,
      isDirty: true,
      lastUpdated: Date.now(),
      version: (this.getStoredForm()?.version || 0) + 1
    };
    
    this.setStoredForm(updatedForm);
    console.log('Saved form data:', {
      chataId: form.chataId,
      clinicianName: form.clinicianInfo.name,
      timestamp: new Date(updatedForm.lastUpdated).toISOString(),
      version: updatedForm.version
    });
  }

  getForm(chataId: string): FormData | null {
    if (!chataId) {
      console.error('Attempted to get form without CHATA ID');
      return null;
    }

    // Ensure requested CHATA ID matches current
    if (chataId !== this.currentChataId) {
      console.error('CHATA ID mismatch during get:', {
        requestedChataId: chataId,
        currentChataId: this.currentChataId
      });
      return null;
    }

    return this.getStoredForm();
  }

  markAsSubmitted(chataId: string): void {
    if (chataId !== this.currentChataId) {
      console.error('Cannot mark as submitted: CHATA ID mismatch');
      return;
    }

    const form = this.getStoredForm();
    if (form) {
      const updatedForm = {
        ...form,
        isSubmitted: true,
        isDirty: false,
        lastUpdated: Date.now()
      };
      this.setStoredForm(updatedForm);
    }
  }

  private async performAutoSave(form: FormData): Promise<void> {
    if (form.chataId !== this.currentChataId) {
      console.error('Cannot auto-save: CHATA ID mismatch');
      return;
    }

    try {
      const updatedForm = {
        ...form,
        isDirty: false,
        lastUpdated: Date.now()
      };
      this.setStoredForm(updatedForm);
    } catch (error) {
      console.error('Auto-save failed:', error);
      const currentForm = this.getStoredForm();
      if (currentForm) {
        const errorForm = {
          ...currentForm,
          isDirty: true,
          errorState: {
            message: error instanceof Error ? error.message : 'Auto-save failed',
            timestamp: Date.now(),
            recoveryAttempts: (currentForm.errorState?.recoveryAttempts || 0) + 1
          }
        };
        this.setStoredForm(errorForm);
      }
    }
  }

  getAllUnsubmittedForms(): FormData[] {
    // Get all forms from storage
    const forms: FormData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const form = JSON.parse(data);
            if (!form.isSubmitted) {
              forms.push(form);
            }
          }
        } catch (error) {
          console.error('Error parsing form data:', error);
        }
      }
    }
    
    return forms;
  }

  getFormByClinicianAndChild(clinicianName: string, childFirstName?: string): FormData | null {
    // First check current form if we have a CHATA ID
    if (this.currentChataId) {
      const currentForm = this.getStoredForm();
      if (currentForm && 
          currentForm.clinicianInfo.name === clinicianName && 
          (!childFirstName || currentForm.clinicianInfo.childFirstName === childFirstName) && 
          !currentForm.isSubmitted) {
        return currentForm;
      }
    }

    // If no current form matches or no CHATA ID, check all unsubmitted forms
    const forms = this.getAllUnsubmittedForms();
    return forms.find(form => 
      form.clinicianInfo.name === clinicianName && 
      (!childFirstName || form.clinicianInfo.childFirstName === childFirstName)
    ) || null;
  }
}

export const formPersistence = new FormPersistenceService(); 