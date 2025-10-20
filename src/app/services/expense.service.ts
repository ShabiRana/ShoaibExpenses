import { Injectable } from "@angular/core";
import { DualStorageService } from './dual-storage.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {

  constructor(private dualStorage: DualStorageService) {}

  // Initialize database
  async init(): Promise<void> {
    await this.dualStorage.initDB();
  }

  // Public methods
  async getRecords(): Promise<any[]> {
    return await this.dualStorage.getRecords();
  }

  async addRecord(record: any): Promise<any> {
    return await this.dualStorage.addRecord(record);
  }

  async updateRecord(record: any): Promise<any> {
    return await this.dualStorage.updateRecord(record);
  }

  async deleteRecord(id: number): Promise<any> {
    return await this.dualStorage.deleteRecord(id);
  }
}