const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // ✅ sqlite3 use karein

let db;
let isDbReady = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:4200');
  win.webContents.openDevTools();
}

// ✅ Initialize Database with sqlite3
function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database('expenses.db', (err) => {
        if (err) {
          console.error('❌ Database connection error:', err);
          reject(err);
          return;
        }
        
        console.log('✅ SQLite connected with sqlite3');
        
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          type TEXT,
          amount REAL,
          note TEXT
        )`, (err) => {
          if (err) {
            console.error('❌ Records table error:', err);
            reject(err);
            return;
          }
          
          db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
          )`, (err) => {
            if (err) {
              console.error('❌ Users table error:', err);
              reject(err);
              return;
            }
            
            // Check and insert default user
            db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
              if (err) {
                console.error('❌ User count error:', err);
                reject(err);
                return;
              }
              
              if (row.count === 0) {
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', '1234'], function(err) {
                  if (err) {
                    console.error('❌ Default user creation error:', err);
                    reject(err);
                    return;
                  }
                  
                  console.log('👤 Default user created: admin / 1234');
                  isDbReady = true;
                  console.log('🎉 Database fully initialized and ready');
                  resolve();
                });
              } else {
                isDbReady = true;
                console.log('🎉 Database fully initialized and ready');
                resolve();
              }
            });
          });
        });
      });
      
    } catch (err) {
      console.error('❌ DB initialization error:', err);
      reject(err);
    }
  });
}

// ✅ Database check function
function checkDatabase() {
  if (!isDbReady || !db) {
    throw new Error('Database not initialized yet. Please wait...');
  }
}

app.whenReady().then(async () => {
  try {
    await initDatabase();
    createWindow();
  } catch (err) {
    console.error('❌ App startup failed:', err);
  }
});

// ✅ IPC Handlers with sqlite3 (callback style)
ipcMain.handle('login-user', async (event, credentials) => {
  return new Promise((resolve, reject) => {
    try {
      checkDatabase();
      
      const { username, password } = credentials;
      db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
          if (err) {
            console.error('❌ Login query error:', err);
            reject(err);
            return;
          }
          
          console.log('🔐 Login attempt:', { username, success: !!row });
          resolve({ success: !!row });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
});

ipcMain.handle('get-records', async () => {
  return new Promise((resolve, reject) => {
    try {
      checkDatabase();
      
      db.all('SELECT * FROM records', (err, rows) => {
        if (err) {
          console.error('❌ Get records error:', err);
          reject(err);
          return;
        }
        
        resolve(rows);
      });
    } catch (err) {
      reject(err);
    }
  });
});

ipcMain.handle('add-record', async (event, record) => {
  return new Promise((resolve, reject) => {
    try {
      checkDatabase();
      
      const { date, type, amount, note } = record;
      db.run(
        'INSERT INTO records (date, type, amount, note) VALUES (?, ?, ?, ?)',
        [date, type, amount, note],
        function(err) {
          if (err) {
            console.error('❌ Add record error:', err);
            reject(err);
            return;
          }
          
          resolve({ id: this.lastID });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
});

// Add other IPC handlers similarly...

ipcMain.handle('update-record', async (event, record) => {
  return new Promise((resolve, reject) => {
    try {
      checkDatabase();
      
      const { id, date, type, amount, note } = record;
      db.run(
        'UPDATE records SET date = ?, type = ?, amount = ?, note = ? WHERE id = ?',
        [date, type, amount, note, id],
        function(err) {
          if (err) {
            console.error('❌ Update record error:', err);
            reject(err);
            return;
          }
          
          resolve({ changes: this.changes });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
});

ipcMain.handle('delete-record', async (event, id) => {
  return new Promise((resolve, reject) => {
    try {
      checkDatabase();
      
      db.run('DELETE FROM records WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('❌ Delete record error:', err);
          reject(err);
          return;
        }
        
        resolve({ changes: this.changes });
      });
    } catch (err) {
      reject(err);
    }
  });
});