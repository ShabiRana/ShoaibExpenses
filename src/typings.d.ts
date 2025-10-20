export {};

declare global {
  interface Window {
    electronAPI: {
      getRecords: () => Promise<any>;
      addRecord: (record: any) => Promise<any>;
      deleteRecord: (id: any) => Promise<any>;
      loginUser: (credentials: any) => Promise<{ success: boolean }>;
    };
  }
}

