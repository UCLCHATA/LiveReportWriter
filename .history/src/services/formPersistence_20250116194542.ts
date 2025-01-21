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
      // Clear any old data for this CHATA ID
      this.clearAllStorageExcept(this.currentChataId);
    }
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

    // Validate CHATA ID matches current URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlChataId = urlParams.get('chataId');
    
    if (form.chataId !== urlChataId) {
      console.error('CHATA ID mismatch during save:', {
        formChataId: form.chataId,
        urlChataId
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

  getFormByClinicianAndChild(clinicianName: string, childFirstName?: string): FormData | null {
    // Get current form only
    const form = this.getStoredForm();
    
    // Check if form exists and matches the criteria
    if (form && 
        form.clinicianInfo.name === clinicianName && 
        (!childFirstName || form.clinicianInfo.childFirstName === childFirstName) && 
        !form.isSubmitted) {
      return form;
    }
    
    return null;
  }
}

export const formPersistence = new FormPersistenceService(); 