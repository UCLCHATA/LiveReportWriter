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
    try {
      // First check URL for CHATA ID
      const urlParams = new URLSearchParams(window.location.search);
      const chataId = urlParams.get('chataId');

      if (chataId) {
        console.log('Found CHATA ID in URL:', chataId);
        const stored = this.loadFromStorage(chataId);
        if (stored) {
          // Validate timestamp before converting
          if (!this.isValidTimestamp(stored.timestamp)) {
            stored.timestamp = Date.now();
          }
          this.currentState = this.convertToRuntime(stored);
          this.notifySubscribers();
        } else {
          console.log('No stored form found for CHATA ID:', chataId);
        }
      } else {
        // Look for most recent unsubmitted form
        const forms = this.getAllStoredForms()
          .filter(f => !f.isSubmitted && this.isValidTimestamp(f.timestamp))
          .sort((a, b) => b.timestamp - a.timestamp);
        
        const latest = forms[0];
        if (latest) {
          this.currentState = this.convertToRuntime(latest);
          this.notifySubscribers();
          
          // Update URL
          const url = new URL(window.location.href);
          url.searchParams.set('chataId', latest.chataId);
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (error) {
      console.error('Error initializing form state:', error);
      // Reset to clean state if initialization fails
      this.currentState = null;
      this.notifySubscribers();
    }
  }

  // Helper to validate timestamps
  private isValidTimestamp(timestamp: number): boolean {
    try {
      const date = new Date(timestamp);
      // Check if date is valid and within reasonable range (last 10 years to 10 years in future)
      const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      return !isNaN(date.getTime()) && 
             Math.abs(now - timestamp) < tenYearsMs &&
             date.toISOString() !== 'Invalid Date';
    } catch {
      return false;
    }
  }

  // Convert persistence state to runtime state
  private convertToRuntime(stored: PersistenceFormState): RuntimeFormState {
    // Ensure we have valid timestamp
    const timestamp = this.isValidTimestamp(stored.timestamp) ? 
      stored.timestamp : Date.now();

    // Ensure we have valid assessment state
    const assessments = this.ensureValidAssessments(stored.assessments);

    return {
      chataId: stored.chataId,
      timestamp,
      clinician: stored.clinicianInfo,
      formData: stored.formData || this.getDefaultFormData(),
      assessments,
      status: stored.isSubmitted ? 'submitted' : 'draft',
      version: stored.version
    };
  }

  private getDefaultFormData(): FormData {
    return {
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
    };
  }

  private ensureValidAssessments(assessments: AssessmentData | undefined): Required<AssessmentData> {
    const defaultAssessments = this.getDefaultAssessments();
    if (!assessments) return defaultAssessments;

    // Merge existing assessments with defaults to ensure all required fields
    return {
      sensoryProfile: { ...defaultAssessments.sensoryProfile, ...assessments.sensoryProfile },
      socialCommunication: { ...defaultAssessments.socialCommunication, ...assessments.socialCommunication },
      behaviorInterests: { ...defaultAssessments.behaviorInterests, ...assessments.behaviorInterests },
      milestones: { ...defaultAssessments.milestones, ...assessments.milestones },
      assessmentLog: { ...defaultAssessments.assessmentLog, ...assessments.assessmentLog },
      summary: { ...defaultAssessments.summary, ...assessments.summary }
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

  updateState(updates: Partial<RuntimeFormState>) {
    if (!this.currentState) {
      // Initialize new state
      this.currentState = this.initializeNewState(updates);
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
    try {
      // 1. Clear all form storage first
      const formsToRemove = this.getAllStoredForms();
      formsToRemove.forEach(form => {
        const key = this.getStorageKey(form.chataId);
        const backupKey = this.getBackupKey(form.chataId);
        localStorage.removeItem(key);
        localStorage.removeItem(backupKey);
      });

      // 2. Clear URL
      const url = new URL(window.location.href);
      url.searchParams.delete('chataId');
      window.history.replaceState({}, '', url.toString());

      // 3. Reset state to null - do this last to ensure clean transition
      this.currentState = null;
      
      // 4. Notify subscribers of state change
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