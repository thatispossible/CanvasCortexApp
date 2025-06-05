const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'kanban_calendar.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Projects table
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT,
          end_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          project_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'backlog',
          complexity_level INTEGER DEFAULT 1,
          start_date TEXT,
          deadline TEXT,
          estimated_hours INTEGER DEFAULT 1,
          position INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id)
        )
      `);

      // Calendar blocks table
      db.run(`
        CREATE TABLE IF NOT EXISTS calendar_blocks (
          id TEXT PRIMARY KEY,
          task_id TEXT,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          date TEXT NOT NULL,
          is_available BOOLEAN DEFAULT 1,
          block_type TEXT DEFAULT 'task',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = {
  db,
  initializeDatabase
}; 