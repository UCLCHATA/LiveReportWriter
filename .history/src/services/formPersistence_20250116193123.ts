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

  constructor() {
    this.autoSaveDebounced = debounce(this.performAutoSave.bind(this), AUTO_SAVE_DELAY);
    this.initializeService();
  }

  private initializeService() {
    // Load existing IDs on initialization
    const forms = this.getStoredForms();
    const existingIds = Object.keys(forms);
    
    if (existingIds.length > 0) {
      import('../utils/chataId').then(({ loadExistingIds }) => {
        loadExistingIds(existingIds);
      });
    }

    // Attempt to recover any forms that might have been lost
    this.attemptFormRecovery();

    // Start periodic backup
    this.startPeriodicBackup();
  }

  private getStoredForms(): Record<string, FormData> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
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
    // Remove any existing forms for this CHATA ID
    const forms = this.getStoredForms();
    
    // Update the form with current timestamp
    forms[form.chataId] = {
      ...form,
      isDirty: true,
      lastUpdated: Date.now(),
      version: (forms[form.chataId]?.version || 0) + 1
    };
    
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
    const forms = this.getStoredForms();
    const form = forms[chataId];
    
    // Only return form if it exists and hasn't been submitted
    if (form && !form.isSubmitted) {
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