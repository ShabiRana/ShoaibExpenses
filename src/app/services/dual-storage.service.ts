import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DualStorageService {
  private isElectron = !!(window && (window as any).electronAPI);
  private dbName = 'ExpenseTracker';
  private dbVersion = 1;
  private db: any;

  // Initialize database based on platform
  async initDB(): Promise<void> {
    if (this.isElectron) {
      console.log('📱 Electron mode - SQLite database will be used');
      return; // Electron mein SQLite automatically handle hoga
    } else {
      console.log('🌐 Web mode - IndexedDB initializing...');
      return this.initIndexedDB();
    }
  }

  // Web version: IndexedDB setup
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB connected');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        console.log('🔄 Creating IndexedDB tables...');

        // Records table
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          console.log('✅ Records table created');
        }

        // Add some sample data for web version
        this.addSampleData(db);
      };
    });
  }

  // Web version ke liye sample data
  private async addSampleData(db: any) {
    const transaction = db.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    
    // Check if already has data
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        console.log('📝 Adding sample data for web version...');
        
        const sampleRecords = [
          { date: '2024-01-15', type: 'Income', amount: 50000, note: 'Salary' },
          { date: '2024-01-16', type: 'Expense', amount: 5000, note: 'Karachi Committee' },
          { date: '2024-01-17', type: 'Expense', amount: 3000, note: 'Medicine' }
        ];

        sampleRecords.forEach(record => {
          store.add(record);
        });
        
        console.log('✅ Sample data added');
      }
    };
  }

  // === RECORDS OPERATIONS ===

  async getRecords(): Promise<any[]> {
    if (this.isElectron) {
      console.log('📱 Getting records from SQLite...');
      return await (window as any).electronAPI.getRecords();
    } else {
      console.log('🌐 Getting records from IndexedDB...');
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['records'], 'readonly');
        const store = transaction.objectStore('records');
        const request = store.getAll();

        request.onsuccess = () => {
          console.log(`📊 Found ${request.result.length} records in IndexedDB`);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  async addRecord(record: any): Promise<any> {
    if (this.isElectron) {
      console.log('📱 Adding record to SQLite...', record);
      return await (window as any).electronAPI.addRecord(record);
    } else {
      console.log('🌐 Adding record to IndexedDB...', record);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.add(record);

        request.onsuccess = () => {
          console.log('✅ Record added to IndexedDB, ID:', request.result);
          resolve({ id: request.result });
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  async updateRecord(record: any): Promise<any> {
    if (this.isElectron) {
      console.log('📱 Updating record in SQLite...', record);
      return await (window as any).electronAPI.updateRecord(record);
    } else {
      console.log('🌐 Updating record in IndexedDB...', record);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.put(record);

        request.onsuccess = () => resolve({ changes: 1 });
        request.onerror = () => reject(request.error);
      });
    }
  }

  async deleteRecord(id: number): Promise<any> {
    if (this.isElectron) {
      console.log('📱 Deleting record from SQLite...', id);
      return await (window as any).electronAPI.deleteRecord(id);
    } else {
      console.log('🌐 Deleting record from IndexedDB...', id);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.delete(id);

        request.onsuccess = () => resolve({ changes: 1 });
        request.onerror = () => reject(request.error);
      });
    }
  }

  // === LOGIN OPERATIONS ===

  async loginUser(credentials: any): Promise<any> {
    if (this.isElectron) {
      console.log('📱 Login via SQLite...');
      return await (window as any).electronAPI.loginUser(credentials);
    } else {
      console.log('🌐 Login for web version...');
      // Web version - simple hardcoded login
      const isValid = credentials.username === 'admin' && credentials.password === '1234';
      console.log('🔐 Login result:', isValid ? 'SUCCESS' : 'FAILED');
      return { success: isValid };
    }
  }
}