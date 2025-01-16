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
      // Clean up old forms and only keep current CHATA ID's data
      this.cleanupFormsExcept(this.currentChataId);
      
      // Clear any forms with mismatched CHATA IDs
      const forms = this.getStoredForms();
      Object.keys(forms).forEach(id => {
        if (forms[id].chataId !== this.currentChataId) {
          delete forms[id];
        }
      });
      this.setStoredForms(forms);
    }

    // Start periodic backup only for current form
    this.startPeriodicBackup();
  }

  private cleanupFormsExcept(chataId: string): void {
    console.log('Cleaning up forms for CHATA ID:', chataId);
    const forms = this.getStoredForms();
    
    // Only keep the current CHATA ID's form
    const cleanedForms = Object.entries(forms).reduce((acc, [id, form]) => {
      if (form.chataId === chataId) {
        acc[id] = form;
      } else {
        console.log('Removing form with different CHATA ID:', form.chataId);
      }
      return acc;
    }, {} as Record<string, FormData>);
    
    this.setStoredForms(cleanedForms);
    console.log('Forms after cleanup:', Object.keys(cleanedForms));
  }

  private getStoredForms(): Record<string, FormData> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const forms = data ? JSON.parse(data) : {};
      
      // Filter out any forms with mismatched CHATA IDs
      if (this.currentChataId) {
        Object.keys(forms).forEach(id => {
          if (forms[id].chataId !== this.currentChataId) {
            console.log('Found form with mismatched CHATA ID:', {
              formId: id,
              formChataId: forms[id].chataId,
              currentChataId: this.currentChataId
            });
            delete forms[id];
          }
        });
      }
      
      console.log('Retrieved stored forms:', {
        totalForms: Object.keys(forms).length,
        currentChataId: this.currentChataId,
        formIds: Object.keys(forms)
      });
      
      return forms;
    } catch (error) {
      console.error('Error getting stored forms:', error);
      return {};
    }
  }

  private setStoredForms(forms: Record<string, FormData>, createBackup: boolean = true): void {
    try {
      // Clean up old forms before saving
      const cleanedForms = this.removeOldForms(forms);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedForms));
      
      if (createBackup) {
        this.createBackup(cleanedForms);
      }
    } catch (error) {
      console.error('Error setting stored forms:', error);
    }
  }

  // Add method to remove old forms
  private removeOldForms(forms: Record<string, FormData>): Record<string, FormData> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return Object.entries(forms).reduce((acc, [id, form]) => {
      // Keep form if it's recent or not submitted
      if (!form.isSubmitted || now - form.lastUpdated < maxAge) {
        acc[id] = form;
      }
      return acc;
    }, {} as Record<string, FormData>);
  }

  private createBackup(forms: Record<string, FormData>): void {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify({
        forms,
        timestamp: Date.now(),
        version: this.version
      }));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  private startPeriodicBackup(): void {
    setInterval(() => {
      const forms = this.getStoredForms();
      this.createBackup(forms);
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private attemptFormRecovery(): void {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (!backup) return;

      const backupData = JSON.parse(backup);
      
      // Type guard for backup data
      if (!this.isValidBackupData(backupData)) {
        console.error('Invalid backup data format');
        return;
      }

      const { forms: backupForms, timestamp, version } = backupData;
      const currentForms = this.getStoredForms();

      // Check if backup is newer than current forms
      Object.entries(backupForms).forEach(([id, backupForm]) => {
        const currentForm = currentForms[id];
        if (!currentForm || (backupForm.lastSavedAt || 0) > (currentForm.lastSavedAt || 0)) {
          currentForms[id] = backupForm;
        }
      });

      this.setStoredForms(currentForms, false);
    } catch (error) {
      console.error('Error during form recovery:', error);
    }
  }

  // Type guard for backup data
  private isValidBackupData(data: any): data is { 
    forms: Record<string, FormData>; 
    timestamp: number; 
    version: number; 
  } {
    return (
      typeof data === 'object' &&
      data !== null &&
      'forms' in data &&
      'timestamp' in data &&
      'version' in data &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'number' &&
      typeof data.forms === 'object' &&
      data.forms !== null
    );
  }

  saveForm(form: FormData): void {
    if (!form.chataId) {
      console.error('Attempted to save form without CHATA ID');
      return;
    }

    // Validate CHATA ID matches current
    const urlParams = new URLSearchParams(window.location.search);
    const urlChataId = urlParams.get('chataId');
    
    if (form.chataId !== urlChataId) {
      console.error('CHATA ID mismatch during save:', {
        formChataId: form.chataId,
        urlChataId
      });
      return;
    }

    // Update current CHATA ID if it has changed
    if (this.currentChataId !== form.chataId) {
      console.log('CHATA ID changed:', { from: this.currentChataId, to: form.chataId });
      this.currentChataId = form.chataId;
      this.cleanupFormsExcept(form.chataId);
    }

    const forms = this.getStoredForms();
    
    // Update the form with current timestamp
    forms[form.chataId] = {
      ...form,
      isDirty: true,
      lastUpdated: Date.now(),
      version: (forms[form.chataId]?.version || 0) + 1
    };
    
    console.log('Saving form:', {
      chataId: form.chataId,
      version: forms[form.chataId].version,
      lastUpdated: new Date(forms[form.chataId].lastUpdated).toISOString()
    });
    
    this.setStoredForms(forms);
  }

  autoSave(form: FormData): void {
    this.autoSaveDebounced(form);
  }

  private async performAutoSave(form: FormData): Promise<void> {
    try {
      const forms = this.getStoredForms();
      forms[form.chataId] = {
        ...form,
        isDirty: false,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Mark form as dirty to trigger another save attempt
      const forms = this.getStoredForms();
      if (forms[form.chataId]) {
        forms[form.chataId].isDirty = true;
        forms[form.chataId].errorState = {
          message: error instanceof Error ? error.message : 'Auto-save failed',
          timestamp: Date.now(),
          recoveryAttempts: (forms[form.chataId].errorState?.recoveryAttempts || 0) + 1
        };
        this.setStoredForms(forms, false);
      }
    }
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

    const forms = this.getStoredForms();
    const form = forms[chataId];
    
    console.log('Getting form:', {
      requestedChataId: chataId,
      found: !!form,
      isSubmitted: form?.isSubmitted,
      lastUpdated: form ? new Date(form.lastUpdated).toISOString() : null
    });
    
    // Only return form if it exists, hasn't been submitted, and matches current CHATA ID
    if (form && !form.isSubmitted && form.chataId === urlChataId) {
      return form;
    }
    
    return null;
  }

  getFormByClinicianEmail(email: string): FormData | null {
    const forms = this.getStoredForms();
    return Object.values(forms).find(
      form => form.clinicianInfo.email === email && !form.isSubmitted
    ) || null;
  }

  markAsSubmitted(chataId: string): void {
    const forms = this.getStoredForms();
    if (forms[chataId]) {
      forms[chataId] = {
        ...forms[chataId],
        isSubmitted: true,
        isDirty: false,
        lastUpdated: Date.now()
      };
      this.setStoredForms(forms);
    }
  }

  getAllUnsubmittedForms(): FormData[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => !form.isSubmitted);
  }

  getDirtyForms(): FormData[] {
    const forms = this.getStoredForms();
    return Object.values(forms).filter(form => form.isDirty);
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
    }, {} as Record<string, FormData>);

    this.setStoredForms(cleanedForms);
  }

  getFormByClinicianAndChild(clinicianName: string, childFirstName?: string): FormData | null {
    const forms = this.getStoredForms();
    return Object.values(forms).find(
      form => 
        form.clinicianInfo.name === clinicianName && 
        (!childFirstName || form.clinicianInfo.childFirstName === childFirstName) && 
        !form.isSubmitted
    ) || null;
  }

  // Cleanup on component unmount
  dispose(): void {
    this.autoSaveDebounced.cancel();
  }
}

export const formPersistence = new FormPersistenceService(); 