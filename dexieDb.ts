import Dexie, { Table } from 'dexie';

export interface OfflineIncident {
  clientId: string;
  hazardType: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  district: string;
  village: string;
  affectedPeople: number;
  roadStatus: string;
  attachments: string[];
  syncStatus: 'pending' | 'synced' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export class DisasterDatabase extends Dexie {
  incidents!: Table<OfflineIncident, string>;

  constructor() {
    super('NERDisasterOfflineDB');
    this.version(1).stores({
      incidents: 'clientId, syncStatus, hazardType, district, createdAt'
    });
  }
}

export const db = new DisasterDatabase();
