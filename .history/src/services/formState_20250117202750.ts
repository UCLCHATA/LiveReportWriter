import { debounce } from 'lodash';
import type { 
  RuntimeFormState,
  PersistenceFormState,
  SheetySubmissionData
} from '../types/formState';
import type {
  ClinicianInfo,
  FormData,
  AssessmentData
} from '../types';

const STORAGE_PREFIX = 'r3_form_';
const BACKUP_PREFIX = 'r3_backup_';
const AUTO_SAVE_DELAY = 2000;
const MAX_RECOVERY_ATTEMPTS = 3;

export class FormStateService {
  private currentState: RuntimeFormState | null = null;
  private version = 1;
  private autoSave: ReturnType<typeof debounce>;
  private subscribers: Set<(state: RuntimeFormState) => void> = new Set();

  constructor() {
    this.autoSave = debounce(this.persistState.bind(this), AUTO_SAVE_DELAY);
    this.initializeFromStorage();
  }

  // Initialize state from storage or URL
  private initializeFromStorage() {
    // First check URL for CHATA ID
    const urlParams = new URLSearchParams(window.location.search);
    const chataId = urlParams.get('chataId');

    if (chataId) {
      const stored = this.loadFromStorage(chataId);
      if (stored) {
        this.currentState = this.convertToRuntime(stored);
        this.notifySubscribers();
      }
    } else {
      // Look for most recent unsubmitted form
      const forms = this.getAllStoredForms();
      const latest = forms
        .filter(f => !f.isSubmitted)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (latest) {
        this.currentState = this.convertToRuntime(latest);
        this.notifySubscribers();
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('chataId', latest.chataId);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }

  // Convert persistence state to runtime state
  private convertToRuntime(stored: PersistenceFormState): RuntimeFormState {
    return {
      chataId: stored.chataId,
      timestamp: stored.timestamp,
      clinician: stored.clinicianInfo,
      formData: stored.formData,
      assessments: stored.assessments as Required<AssessmentData>,
      status: stored.isSubmitted ? 'submitted' : 'draft',
      version: stored.version
    };
  }

  // Convert runtime state to persistence state
  private convertToPersistence(state: RuntimeFormState): PersistenceFormState {
    return {
      chataId: state.chataId,
      timestamp: state.timestamp,
      clinicianInfo: state.clinician,
      formData: state.formData,
      assessments: state.assessments,
      isDirty: true,
      isSubmitted: state.status === 'submitted',
      version: state.version
    };
  }

  // Convert runtime state to API submission format
  private convertToSubmission(state: RuntimeFormState): SheetySubmissionData {
    return {
      chataId: state.chataId,
      timestamp: new Date(state.timestamp).toISOString(),
      clinicianName: state.clinician.name,
      clinicianEmail: state.clinician.email,
      clinicName: state.clinician.clinicName,
      childInfo: JSON.stringify({
        firstName: state.clinician.childFirstName,
        lastName: state.clinician.childLastName,
        age: state.clinician.childAge,
        gender: state.clinician.childGender
      }),
      formData: JSON.stringify(state.formData),
      assessments: JSON.stringify(state.assessments)
    };
  }

  // Storage helpers
  private getStorageKey(chataId: string) {
    return `${STORAGE_PREFIX}${chataId}`;
  }

  private getBackupKey(chataId: string) {
    return `${BACKUP_PREFIX}${chataId}`;
  }

  private loadFromStorage(chataId: string): PersistenceFormState | null {
    try {
      const key = this.getStorageKey(chataId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      console.error('Failed to load form:', error);
      return null;
    }
  }

  private persistState() {
    if (!this.currentState) return;

    try {
      // Save current state
      const persistence = this.convertToPersistence(this.currentState);
      const key = this.getStorageKey(this.currentState.chataId);
      localStorage.setItem(key, JSON.stringify(persistence));

      // Create backup
      const backupKey = this.getBackupKey(this.currentState.chataId);
      localStorage.setItem(backupKey, JSON.stringify(persistence));

      console.log('Saved form state:', {
        chataId: this.currentState.chataId,
        timestamp: new Date(this.currentState.timestamp).toISOString()
      });
    } catch (error) {
      console.error('Failed to save form:', error);
    }
  }

  private getAllStoredForms(): PersistenceFormState[] {
    const forms: PersistenceFormState[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            forms.push(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Failed to load form:', error);
        }
      }
    }

    return forms;
  }

  // Public API
  subscribe(callback: (state: RuntimeFormState) => void) {
    this.subscribers.add(callback);
    if (this.currentState) {
      callback(this.currentState);
    }
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    if (!this.currentState) return;
    this.subscribers.forEach(callback => callback(this.currentState!));
  }

  getCurrentState(): RuntimeFormState | null {
    return this.currentState;
  }

  updateState(updates: Partial<RuntimeFormState>) {
    if (!this.currentState) {
      // Initialize new state
      this.currentState = {
        chataId: updates.chataId || crypto.randomUUID(),
        timestamp: Date.now(),
        clinician: updates.clinician || {
          name: '',
          email: '',
          clinicName: '',
          childFirstName: '',
          childLastName: '',
          childAge: '',
          childGender: ''
        },
        formData: updates.formData || {
          status: 'draft',
          ascStatus: '',
          adhdStatus: '',
          referrals: {
            speech: false,
            educational: false,
            sleep: false,
            occupational: false,
            mental: false,
            other: false
          },
          remarks: '',
          clinicalObservations: '',
          priorityAreas: '',
          strengths: '',
          recommendations: '',
          formProgress: 0,
          lastUpdated: new Date().toISOString(),
          differentialDiagnosis: '',
          developmentalConcerns: '',
          medicalHistory: '',
          familyHistory: ''
        },
        assessments: updates.assessments || {
          sensoryProfile: {
            type: 'sensoryProfile',
            domains: {},
            progress: 0,
            isComplete: false
          },
          socialCommunication: {
            type: 'socialCommunication',
            domains: {},
            progress: 0,
            isComplete: false
          },
          behaviorInterests: {
            type: 'behaviorInterests',
            domains: {},
            progress: 0,
            isComplete: false
          },
          milestones: {
            type: 'milestoneTracker',
            milestones: [],
            customMilestones: [],
            history: '',
            progress: 0,
            formProgress: 0,
            isComplete: false,
            lastUpdated: new Date().toISOString()
          },
          assessmentLog: {
            type: 'assessmentLog',
            selectedAssessments: [],
            entries: {},
            progress: 0,
            isComplete: false
          },
          summary: {
            type: 'summary',
            progress: 0,
            isComplete: false,
            lastUpdated: new Date().toISOString()
          }
        } as Required<AssessmentData>,
        status: 'draft',
        version: this.version
      };
    } else {
      // Update existing state
      this.currentState = {
        ...this.currentState,
        ...updates,
        version: this.currentState.version + 1
      };
    }

    this.notifySubscribers();
    this.autoSave();
  }

  clearState() {
    if (!this.currentState) return;

    const key = this.getStorageKey(this.currentState.chataId);
    const backupKey = this.getBackupKey(this.currentState.chataId);

    localStorage.removeItem(key);
    localStorage.removeItem(backupKey);

    this.currentState = null;
    this.notifySubscribers();
  }

  prepareForSubmission(): SheetySubmissionData | null {
    if (!this.currentState) return null;
    return this.convertToSubmission(this.currentState);
  }
} 