import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DbService {
  async createRecord(rec: { type: string; amount: number; note?: string; date: string }) {
    return window.electronAPI?.createRecord(rec);
  }
  async getRecords() {
    return (await window.electronAPI?.getRecords()) || [];
  }
  async deleteRecord(id: number) {
    return window.electronAPI?.deleteRecord(id);
  }
  async getTotals() {
    return (await window.electronAPI?.getTotals()) || { income:0, expense:0, committee:0, balance:0 };
  }
}
