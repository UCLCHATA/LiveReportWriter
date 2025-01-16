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
      this.preserveLatestFormAndCleanup();
    }
  }

  private preserveLatestFormAndCleanup(): void {
    const forms: { chataId: string; timestamp: number; }[] = [];
    
    // Collect all forms and their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const form = JSON.parse(data);
            forms.push({
              chataId: form.chataId,
              timestamp: form.lastUpdated || 0
            });
          }
        } catch (error) {
          console.error('Error parsing form data:', error);
        }
      }
    }

    // Sort forms by timestamp (newest first)
    forms.sort((a, b) => b.timestamp - a.timestamp);

    // Keep only the most recent form (if it exists) and current form
    const formsToKeep = new Set<string>();
    if (forms.length > 0) {
      formsToKeep.add(forms[0].chataId); // Most recent form
    }
    if (this.currentChataId) {
      formsToKeep.add(this.currentChataId); // Current form
    }

    // Remove all other forms
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        const chataId = key.replace(this.STORAGE_PREFIX, '');
        if (!formsToKeep.has(chataId)) {
          console.log('Removing old form:', chataId);
          localStorage.removeItem(key);
        }
      }
    }

    console.log('Preserved forms:', Array.from(formsToKeep));
  }

  // New method to get storage key for specific CHATA ID
  private getStorageKey(chataId: string): string {
    return `${this.STORAGE_PREFIX}${chataId}`;
  }

  // New method to clear all storage except current CHATA ID
  private clearAllStorageExcept(currentChataId: string): void {
    console.log('Clearing all storage except:', currentChataId);
    
    // Clear main storage
    const currentKey = this.getStorageKey(currentChataId);
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX) && key !== currentKey) {
        console.log('Removing old storage:', key);
        localStorage.removeItem(key);
      }
    }
    
    // Clear backup
    localStorage.removeItem(BACKUP_KEY);
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
      console.log('Retrieved form for CHATA ID:', {
        chataId: this.currentChataId,
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

    // Update currentChataId if not set
    if (!this.currentChataId) {
      this.currentChataId = form.chataId;
      // Update URL with CHATA ID
      const url = new URL(window.location.href);
      url.searchParams.set('chataId', form.chataId);
      window.history.replaceState({}, '', url.toString());
    }

    // Validate CHATA ID matches current
    if (form.chataId !== this.currentChataId) {
      console.error('CHATA ID mismatch during save:', {
        formChataId: form.chataId,
        currentChataId: this.currentChataId
      });
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
      timestamp: new Date(updatedForm.lastUpdated).toISOString(),
      version: updatedForm.version
    });
  }

  getForm(chataId: string): FormData | null {
    if (!chataId) {
      console.error('Attempted to get form without CHATA ID');
      return null;
    }

    // Validate CHATA ID matches current URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlChataId = urlParams.get('chataId');
    
    if (chataId !== urlChataId) {
      console.error('CHATA ID mismatch during get:', {
        requestedChataId: chataId,
        urlChataId
      });
      return null;
    }

    const form = this.getStoredForm();
    
    // Only return form if it exists and hasn't been submitted
    if (form && !form.isSubmitted) {
      return form;
    }
    
    return null;
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