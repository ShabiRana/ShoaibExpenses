const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRecords: () => ipcRenderer.invoke('get-records'),
  addRecord: (record) => ipcRenderer.invoke('add-record', record),
  updateRecord: (record) => ipcRenderer.invoke('update-record', record),
  deleteRecord: (id) => ipcRenderer.invoke('delete-record', id),
  loginUser: (credentials) => ipcRenderer.invoke('login-user', credentials)
});