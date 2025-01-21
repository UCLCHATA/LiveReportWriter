import { debounce } from 'lodash';
const STORAGE_PREFIX = 'r3_form_';
const BACKUP_PREFIX = 'r3_backup_';
const AUTO_SAVE_DELAY = 2000;
const MAX_RECOVERY_ATTEMPTS = 3;
export class FormStateService {
    constructor() {
        Object.defineProperty(this, "currentState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "autoSave", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "subscribers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        this.autoSave = debounce(this.persistState.bind(this), AUTO_SAVE_DELAY);
        this.initializeFromStorage();
    }
    // Initialize state from storage or URL
    initializeFromStorage() {
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
    convertToRuntime(stored) {
        // Ensure timestamp is valid
        let timestamp = stored.timestamp;
        try {
            new Date(timestamp).toISOString();
        }
        catch (error) {
            console.error('Invalid timestamp in stored form, using current time:', timestamp);
            timestamp = Date.now();
        }
        return {
            chataId: stored.chataId,
            timestamp,
            clinician: stored.clinicianInfo,
            formData: stored.formData,
            assessments: stored.assessments,
            status: stored.isSubmitted ? 'submitted' : 'draft',
            version: stored.version
        };
    }
    // Convert runtime state to persistence state
    convertToPersistence(state) {
        // Ensure timestamp is valid
        let timestamp = state.timestamp;
        try {
            new Date(timestamp).toISOString();
        }
        catch (error) {
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
    convertToSubmission(state) {
        // Ensure timestamp is valid
        let timestamp;
        try {
            timestamp = new Date(state.timestamp).toISOString();
        }
        catch (error) {
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
    getStorageKey(chataId) {
        return `${STORAGE_PREFIX}${chataId}`;
    }
    getBackupKey(chataId) {
        return `${BACKUP_PREFIX}${chataId}`;
    }
    loadFromStorage(chataId) {
        try {
            const key = this.getStorageKey(chataId);
            const stored = localStorage.getItem(key);
            if (!stored)
                return null;
            const parsed = JSON.parse(stored);
            return parsed;
        }
        catch (error) {
            console.error('Failed to load form:', error);
            return null;
        }
    }
    persistState() {
        if (!this.currentState)
            return;
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
        }
        catch (error) {
            console.error('Failed to save form:', error);
        }
    }
    getAllStoredForms() {
        const forms = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        forms.push(JSON.parse(stored));
                    }
                }
                catch (error) {
                    console.error('Failed to load form:', error);
                }
            }
        }
        return forms;
    }
    // Public API
    subscribe(callback) {
        this.subscribers.add(callback);
        if (this.currentState) {
            callback(this.currentState);
        }
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        if (!this.currentState)
            return;
        this.subscribers.forEach(callback => callback(this.currentState));
    }
    getCurrentState() {
        return this.currentState;
    }
    initializeNewState(updates) {
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
            },
            status: 'draft',
            version: this.version
        };
    }
    updateState(updates) {
        // If there's a new CHATA ID, always create fresh state
        if (updates.chataId && (!this.currentState || updates.chataId !== this.currentState.chataId)) {
            this.currentState = this.initializeNewState(updates);
        }
        else if (!this.currentState) {
            // Initialize new state if none exists
            this.currentState = this.initializeNewState(updates);
        }
        else {
            // Update existing state only if CHATA ID matches
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
        }
        catch (error) {
            console.error('Error clearing form state:', error);
            // Even if something fails, ensure state is reset
            this.currentState = null;
            this.notifySubscribers();
        }
    }
    prepareForSubmission() {
        if (!this.currentState)
            return null;
        return this.convertToSubmission(this.currentState);
    }
}
