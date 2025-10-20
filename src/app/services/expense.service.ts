import { Injectable } from "@angular/core";

declare const window: any;

@Injectable({ providedIn: 'root' })
export class ExpenseService {

  // getRecords(): Promise<any[]> {
  //   return window.electronAPI.getRecords();
  // }
getRecords(): Promise<any[]> {
  if (!window.electronAPI) throw new Error('Electron API not available!');
  return window.electronAPI.getRecords();
}
addRecord(record: any): Promise<any> {
  if (!window.electronAPI) {
    console.error('Electron API not available!');
    return Promise.reject('Electron API missing');
  }
  return window.electronAPI.addRecord(record);
}


  updateRecord(record: any): Promise<any> {
    return window.electronAPI.updateRecord(record);
  }

  deleteRecord(id: number): Promise<any> {
    return window.electronAPI.deleteRecord(id);
  }
}
