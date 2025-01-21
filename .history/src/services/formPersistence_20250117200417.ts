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
const MAX_STORED_FORMS = 2; // Only keep current and last form

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
    const urlChataId = urlParams.get('chataId');
    
    if (urlChataId) {
      console.log('Found CHATA ID in URL:', urlChataId);
      this.currentChataId = urlChataId;
    } else {
      // If no CHATA ID in URL, try to find most recent unsubmitted form
      const forms = this.getAllForms();
      const latestUnsubmitted = forms
        .filter(form => !form.isSubmitted)
        .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
      
      if (latestUnsubmitted) {
        console.log('Found latest unsubmitted form:', latestUnsubmitted.chataId);
        this.currentChataId = latestUnsubmitted.chataId;
        
        // Update URL with the found CHATA ID
        const url = new URL(window.location.href);
        url.searchParams.set('chataId', latestUnsubmitted.chataId);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }

  // Call this when creating a new form after clinician modal
  initializeNewForm(chataId: string): void {
    console.log('Initializing new form with CHATA ID:', chataId);
    
    // Before setting new CHATA ID, preserve the most recent form
    this.preserveLatestFormAndCleanup();
    
    // Set the new CHATA ID
    this.currentChataId = chataId;
    
    // Update URL with new CHATA ID
    const url = new URL(window.location.href);
    url.searchParams.set('chataId', chataId);
    window.history.replaceState({}, '', url.toString());
  }

  private preserveLatestFormAndCleanup(): void {
    // Get all forms
    const forms = this.getAllForms();
    
    // Sort by lastUpdated timestamp
    forms.sort((a, b) => b.lastUpdated - a.lastUpdated);
    
    // Keep only the most recent form if it exists
    if (forms.length > 0) {
      const latestForm = forms[0];
      console.log('Preserving latest form:', {
        chataId: latestForm.chataId,
        lastUpdated: new Date(latestForm.lastUpdated).toISOString()
      });
      
      // Clear all storage first
      this.clearAllStorage();
      
      // Save back only the latest form
      const key = this.getStorageKey(latestForm.chataId);
      localStorage.setItem(key, JSON.stringify(latestForm));
    } else {
      this.clearAllStorage();
    }
  }

  private getAllForms(): FormData[] {
    const forms: FormData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            forms.push(JSON.parse(data));
          }
        } catch (error) {
          console.error('Error parsing form data:', error);
        }
      }
    }
    
    return forms;
  }

  private cleanupOldForms(): void {
    const forms = this.getAllForms();
    
    // Sort by lastUpdated timestamp
    forms.sort((a, b) => b.lastUpdated - a.lastUpdated);
    
    // Keep only current form and most recent form
    const formsToKeep = forms.slice(0, MAX_STORED_FORMS);
    
    // Clear all storage first
    this.clearAllStorage();
    
    // Save back only the forms to keep
    formsToKeep.forEach(form => {
      const key = this.getStorageKey(form.chataId);
      localStorage.setItem(key, JSON.stringify(form));
    });
    
    console.log('Cleaned up forms:', {
      totalForms: forms.length,
      keptForms: formsToKeep.length,
      keptChataIds: formsToKeep.map(f => f.chataId)
    });
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

    // Ensure form.chataId matches currentChataId
    if (form.chataId !== this.currentChataId) {
      console.error('CHATA ID mismatch during save:', {
        formChataId: form.chataId,
        currentChataId: this.currentChataId
      });
      return;
    }

    // Update the form with current timestamp and increment version
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

  getFormByClinicianAndChild(clinicianName: string, childFirstName?: string): FormData | null {
    // Get all forms
    const forms = this.getAllForms();
    
    // Find first unsubmitted form matching the clinician and child name
    return forms.find(form => 
      form.clinicianInfo.name === clinicianName && 
      (!childFirstName || form.clinicianInfo.childFirstName === childFirstName) &&
      !form.isSubmitted
    ) || null;
  }

  restoreForm(clinicianName: string, childFirstName?: string): FormData | null {
    const form = this.getFormByClinicianAndChild(clinicianName, childFirstName);
    if (form) {
      // Set as current form
      this.currentChataId = form.chataId;
      this.saveForm(form);
      return form;
    }
    return null;
  }
}

export const formPersistence = new FormPersistenceService(); 