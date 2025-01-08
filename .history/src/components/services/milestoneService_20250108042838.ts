import { Milestone } from '../types';

const STORAGE_KEY = 'milestone_data';
const BACKUP_KEY = 'milestone_backup';
const VERSION_KEY = 'milestone_version';
const CURRENT_VERSION = '1.0';

export class MilestoneService {
  private static instance: MilestoneService;
  private gsheetId?: string;

  private constructor() {}

  static getInstance(): MilestoneService {
    if (!MilestoneService.instance) {
      MilestoneService.instance = new MilestoneService();
    }
    return MilestoneService.instance;
  }

  setGSheetId(id: string) {
    this.gsheetId = id;
  }

  // Local Storage Operations
  async saveToLocal(milestones: Milestone[]): Promise<void> {
    try {
      // Save to both localStorage and sessionStorage for redundancy
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
      
      // Update cache timestamp
      const timestamp = new Date().toISOString();
      localStorage.setItem(CACHE_KEY, timestamp);
    } catch (error) {
      console.error('Error saving to local storage:', error);
      throw error;
    }
  }

  async loadFromLocal(): Promise<Milestone[]> {
    try {
      // Try sessionStorage first, fall back to localStorage
      let data = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading from local storage:', error);
      throw error;
    }
  }

  // Google Sheets Operations
  async saveToGSheets(milestones: Milestone[]): Promise<void> {
    if (!this.gsheetId) {
      throw new Error('Google Sheet ID not set');
    }

    try {
      const rows = milestones.map(milestone => [
        milestone.id,
        milestone.domain,
        milestone.description,
        milestone.expectedAgeRange.min,
        milestone.expectedAgeRange.max,
        milestone.actualAge || '',
        milestone.status,
        milestone.source,
        milestone.notes || '',
        milestone.evidence || '',
        new Date().toISOString()
      ]);

      const response = await fetch(`https://script.google.com/macros/s/${this.gsheetId}/exec`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'saveMilestones',
          data: rows,
          timestamp: new Date().toISOString()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to save to Google Sheets');
      }
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      // Don't throw, just log - we'll rely on local storage
      console.warn('Falling back to local storage only');
    }
  }

  async loadFromGSheets(): Promise<Milestone[]> {
    if (!this.gsheetId) {
      return this.loadFromLocal();
    }

    try {
      const response = await fetch(
        `https://script.google.com/macros/s/${this.gsheetId}/exec?action=getMilestones`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load from Google Sheets');
      }

      const data = await response.json();
      
      const milestones = data.map((row: any[]) => ({
        id: row[0],
        domain: row[1],
        description: row[2],
        expectedAgeRange: {
          min: Number(row[3]),
          max: Number(row[4])
        },
        actualAge: row[5] ? Number(row[5]) : undefined,
        status: row[6],
        source: row[7],
        notes: row[8] || undefined,
        evidence: row[9] || undefined
      }));

      // Update local cache
      await this.saveToLocal(milestones);
      return milestones;
    } catch (error) {
      console.error('Error loading from Google Sheets:', error);
      return this.loadFromLocal();
    }
  }

  // Combined save operation with fallback
  async saveAll(milestones: Milestone[]): Promise<void> {
    // Always save locally first
    await this.saveToLocal(milestones);

    // Try to save to Google Sheets if configured
    if (this.gsheetId) {
      try {
        await this.saveToGSheets(milestones);
      } catch (error) {
        console.warn('Failed to save to Google Sheets, data saved locally only');
      }
    }
  }

  // Combined load operation with fallback
  async loadAll(): Promise<Milestone[]> {
    try {
      // Try Google Sheets first if configured
      if (this.gsheetId) {
        return await this.loadFromGSheets();
      }
      // Fall back to local storage
      return await this.loadFromLocal();
    } catch (error) {
      console.error('Error in loadAll:', error);
      // Final fallback - return empty array
      return [];
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CACHE_KEY);
  }

  private createBackup(data: any) {
    try {
      const timestamp = new Date().toISOString();
      const backup = {
        data,
        timestamp,
        version: CURRENT_VERSION
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  private validateData(data: any): boolean {
    // Basic validation of milestone data structure
    return data && 
           typeof data === 'object' && 
           Array.isArray(data.milestones) &&
           typeof data.history === 'string' &&
           typeof data.lastUpdated === 'string';
  }

  saveMilestones(milestones: any) {
    try {
      // Create backup before saving
      const currentData = this.loadMilestones();
      if (currentData) {
        this.createBackup(currentData);
      }

      // Save new data with version
      const dataToSave = {
        ...milestones,
        version: CURRENT_VERSION,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      return true;
    } catch (error) {
      console.error('Error saving milestones:', error);
      return false;
    }
  }

  loadMilestones() {
    try {
      // Try to load from primary storage
      let data = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      
      if (data) {
        const parsed = JSON.parse(data);
        if (this.validateData(parsed)) {
          return parsed;
        }
      }

      // If primary data is invalid, try to restore from backup
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.data && this.validateData(parsed.data)) {
          console.warn('Restored from backup due to invalid primary data');
          this.saveMilestones(parsed.data); // Resave as primary
          return parsed.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error loading milestones:', error);
      return null;
    }
  }

  clearMilestones() {
    try {
      // Create backup before clearing
      const currentData = this.loadMilestones();
      if (currentData) {
        this.createBackup(currentData);
      }

      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VERSION_KEY);
      
      return true;
    } catch (error) {
      console.error('Error clearing milestones:', error);
      return false;
    }
  }

  restoreFromBackup() {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.data && this.validateData(parsed.data)) {
          this.saveMilestones(parsed.data);
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return null;
    }
  }
} 