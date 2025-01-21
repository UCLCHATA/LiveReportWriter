import { Milestone } from '../types';

const LOCAL_STORAGE_KEY = 'autism_milestones';

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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(milestones));
    } catch (error) {
      console.error('Error saving to local storage:', error);
      throw error;
    }
  }

  async loadFromLocal(): Promise<Milestone[]> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
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

      // Call Google Apps Script endpoint
      await fetch(`https://script.google.com/macros/s/${this.gsheetId}/exec`, {
        method: 'POST',
        body: JSON.stringify({ action: 'saveMilestones', data: rows }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      throw error;
    }
  }

  async loadFromGSheets(): Promise<Milestone[]> {
    if (!this.gsheetId) {
      throw new Error('Google Sheet ID not set');
    }

    try {
      const response = await fetch(
        `https://script.google.com/macros/s/${this.gsheetId}/exec?action=getMilestones`
      );
      const data = await response.json();
      
      return data.map((row: any[]) => ({
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
    } catch (error) {
      console.error('Error loading from Google Sheets:', error);
      throw error;
    }
  }

  // Combined save operation
  async saveAll(milestones: Milestone[]): Promise<void> {
    await this.saveToLocal(milestones);
    if (this.gsheetId) {
      await this.saveToGSheets(milestones);
    }
  }

  // Combined load operation
  async loadAll(): Promise<Milestone[]> {
    const localData = await this.loadFromLocal();
    if (!this.gsheetId) {
      return localData;
    }

    try {
      const sheetData = await this.loadFromGSheets();
      // Merge data, preferring Google Sheets data
      const mergedData = [...localData];
      sheetData.forEach(sheetMilestone => {
        const index = mergedData.findIndex(m => m.id === sheetMilestone.id);
        if (index >= 0) {
          mergedData[index] = sheetMilestone;
        } else {
          mergedData.push(sheetMilestone);
        }
      });
      return mergedData;
    } catch (error) {
      console.warn('Failed to load from Google Sheets, using local data:', error);
      return localData;
    }
  }
} 