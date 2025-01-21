import { debounce } from 'lodash';
import type { 
  RuntimeFormState,
  PersistenceFormState,
  SheetySubmissionData,
  ClinicianInfo,
  FormData,
  AssessmentData
} from '../types/formState';

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
    // Only check URL for CHATA ID - no automatic restoration of recent forms
    const urlParams = new URLSearchParams(window.location.search);
    const chataId = urlParams.get('chataId');

    if (chataId) {
      const stored = this.loadFromStorage(chataId);
      if (stored) {
        this.currentState = this.convertToRuntime(stored);
        this.notifySubscribers();
      }
    }
  }

  // Convert persistence state to runtime state
  private convertToRuntime(stored: PersistenceFormState): RuntimeFormState {
    // Ensure timestamp is valid
    let timestamp = stored.timestamp;
    try {
      new Date(timestamp).toISOString();
    } catch (error) {
      console.error('Invalid timestamp in stored form, using current time:', timestamp);
      timestamp = Date.now();
    }

    return {
      chataId: stored.chataId,
      timestamp,
      clinician: stored.clinicianInfo,
      formData: stored.formData,
      assessments: stored.assessments as Required<AssessmentData>,
      status: stored.isSubmitted ? 'submitted' : 'draft',
      version: stored.version
    };
  }

  // Convert runtime state to persistence state
  private convertToPersistence(state: RuntimeFormState): PersistenceFormState {
    // Ensure timestamp is valid
    let timestamp = state.timestamp;
    try {
      new Date(timestamp).toISOString();
    } catch (error) {
      console.error('Invalid timestamp in runtime state, using current time:', timestamp);
      timestamp = Date.now();
    }

    return {
      chataId: state.chataId,
      timestamp,
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
    // Ensure timestamp is valid
    let timestamp;
    try {
      timestamp = new Date(state.timestamp).toISOString();
    } catch (error) {
      console.error('Invalid timestamp in submission state, using current time:', state.timestamp);
      timestamp = new Date().toISOString();
    }

    return {
      chataId: state.chataId,
      timestamp,
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

  private initializeNewState(updates: Partial<RuntimeFormState>): RuntimeFormState {
    return {
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
      formData: {
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
        familyHistory: '',
        ...updates.formData
      },
      assessments: {
        sensoryProfile: {
          type: 'sensoryProfile',
          domains: {
            visual: { name: 'Visual', value: 0, observations: [], label: 'Typical' },
            auditory: { name: 'Auditory', value: 0, observations: [], label: 'Typical' },
            tactile: { name: 'Tactile', value: 0, observations: [], label: 'Typical' },
            vestibular: { name: 'Vestibular', value: 0, observations: [], label: 'Typical' },
            proprioceptive: { name: 'Proprioceptive', value: 0, observations: [], label: 'Typical' },
            oral: { name: 'Oral', value: 0, observations: [], label: 'Typical' }
          },
          progress: 0,
          isComplete: false
        },
        socialCommunication: {
          type: 'socialCommunication',
          domains: {
            jointAttention: { name: 'Joint Attention', value: 0, observations: [], label: 'Age Appropriate' },
            nonverbalCommunication: { name: 'Nonverbal Communication', value: 0, observations: [], label: 'Age Appropriate' },
            verbalCommunication: { name: 'Verbal Communication', value: 0, observations: [], label: 'Age Appropriate' },
            socialUnderstanding: { name: 'Social Understanding', value: 0, observations: [], label: 'Age Appropriate' },
            playSkills: { name: 'Play Skills', value: 0, observations: [], label: 'Age Appropriate' },
            peerInteractions: { name: 'Peer Interactions', value: 0, observations: [], label: 'Age Appropriate' }
          },
          progress: 0,
          isComplete: false
        },
        behaviorInterests: {
          type: 'behaviorInterests',
          domains: {
            repetitiveBehaviors: { name: 'Repetitive Behaviors', value: 0, observations: [], label: 'Not Present' },
            routinesRituals: { name: 'Routines & Rituals', value: 0, observations: [], label: 'Not Present' },
            specialInterests: { name: 'Special Interests', value: 0, observations: [], label: 'Not Present' },
            sensoryInterests: { name: 'Sensory Interests', value: 0, observations: [], label: 'Not Present' },
            emotionalRegulation: { name: 'Emotional Regulation', value: 0, observations: [], label: 'Not Present' },
            flexibility: { name: 'Flexibility', value: 0, observations: [], label: 'Not Present' }
          },
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
        },
        ...updates.assessments
      } as Required<AssessmentData>,
      status: 'draft',
      version: this.version
    };
  }

  private calculateTotalProgress(state: RuntimeFormState): number {
    let totalProgress = 0;
    const assessments = state.assessments;

    // Component progress (50% total, 10% each for first 5 components)
    if (assessments.sensoryProfile?.isComplete) totalProgress += 10;
    if (assessments.socialCommunication?.isComplete) totalProgress += 10;
    if (assessments.behaviorInterests?.isComplete) totalProgress += 10;
    if (assessments.milestones?.isComplete) totalProgress += 10;
    if (assessments.assessmentLog?.isComplete) totalProgress += 10;

    // Text box progress (40% total, 10% each)
    const formData = state.formData;
    if (formData.clinicalObservations?.trim()) totalProgress += 10;
    if (formData.priorityAreas?.trim()) totalProgress += 10;
    if (formData.strengths?.trim()) totalProgress += 10;
    if (formData.recommendations?.trim()) totalProgress += 10;

    // Referrals and status progress (10% total)
    const hasReferrals = Object.values(formData.referrals || {}).some(val => val);
    const hasStatus = formData.ascStatus?.trim() || formData.adhdStatus?.trim();
    if (hasReferrals || hasStatus) totalProgress += 10;

    return Math.min(totalProgress, 100);
  }

  updateState(updates: Partial<RuntimeFormState>) {
    // If there's a new CHATA ID, always create fresh state
    if (updates.chataId && (!this.currentState || updates.chataId !== this.currentState.chataId)) {
      this.currentState = this.initializeNewState(updates);
    } else if (!this.currentState) {
      // Initialize new state if none exists
      this.currentState = this.initializeNewState(updates);
    } else {
      // Update existing state only if CHATA ID matches
      this.currentState = {
        ...this.currentState,
        ...updates,
        version: this.currentState.version + 1
      };

      // Update form progress
      if (this.currentState.formData) {
        this.currentState.formData.formProgress = this.calculateTotalProgress(this.currentState);
      }
    }

    this.notifySubscribers();
    this.autoSave();
  }

  clearState() {
    try {
      // 1. Get current CHATA ID if exists
      const currentChataId = this.currentState?.chataId;
      
      // 2. If we have a current CHATA ID, only remove that form
      if (currentChataId) {
        const key = this.getStorageKey(currentChataId);
        const backupKey = this.getBackupKey(currentChataId);
        localStorage.removeItem(key);
        localStorage.removeItem(backupKey);
      }

      // 3. Clear URL
      const url = new URL(window.location.href);
      url.searchParams.delete('chataId');
      window.history.replaceState({}, '', url.toString());

      // 4. Reset state to null
      this.currentState = null;
      
      // 5. Notify subscribers of state change
      this.notifySubscribers();

      console.log('Form state cleared successfully');
    } catch (error) {
      console.error('Error clearing form state:', error);
      // Even if something fails, ensure state is reset
      this.currentState = null;
      this.notifySubscribers();
    }
  }

  prepareForSubmission(): SheetySubmissionData | null {
    if (!this.currentState) return null;
    return this.convertToSubmission(this.currentState);
  }
} 