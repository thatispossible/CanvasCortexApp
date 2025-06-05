const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

const router = express.Router();

const KANBAN_COLUMNS = ['backlog', 'planned', 'next_up', 'in_progress', 'done', 'archive'];

// GET all tasks
router.get('/', (req, res) => {
  const { project_id, status } = req.query;
  
  let query = 'SELECT * FROM tasks';
  let params = [];
  
  if (project_id || status) {
    query += ' WHERE';
    const conditions = [];
    
    if (project_id) {
      conditions.push(' project_id = ?');
      params.push(project_id);
    }
    
    if (status) {
      conditions.push(' status = ?');
      params.push(status);
    }
    
    query += conditions.join(' AND');
  }
  
  query += ' ORDER BY position, created_at';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single task
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  });
});

// POST create new task
router.post('/', (req, res) => {
  const { project_id, title, description, complexity_level, start_date, deadline, estimated_hours } = req.body;
  const taskId = uuidv4();
  
  db.run(
    'INSERT INTO tasks (id, project_id, title, description, complexity_level, start_date, deadline, estimated_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [taskId, project_id, title, description, complexity_level || 1, start_date, deadline, estimated_hours || 1],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created task
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// PUT update task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, complexity_level, start_date, deadline, estimated_hours, position } = req.body;
  
  db.run(
    'UPDATE tasks SET title = ?, description = ?, status = ?, complexity_level = ?, start_date = ?, deadline = ?, estimated_hours = ?, position = ? WHERE id = ?',
    [title, description, status, complexity_level, start_date, deadline, estimated_hours, position, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      // Return updated task
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// PUT update task status (for Kanban movement)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, position } = req.body;
  
  if (!KANBAN_COLUMNS.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  
  db.run(
    'UPDATE tasks SET status = ?, position = ? WHERE id = ?',
    [status, position || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      // Auto-progression logic
      let nextStatus = status;
      if (status === 'done') {
        // Auto-move to archive after some time (for now, just keep in done)
        nextStatus = 'done';
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// DELETE task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    // Delete calendar blocks for this task
    db.run('DELETE FROM calendar_blocks WHERE task_id = ?', [id]);
    
    // Delete task
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json({ message: 'Task deleted successfully' });
    });
  });
});

// GET tasks grouped by Kanban columns
router.get('/kanban/:project_id', (req, res) => {
  const { project_id } = req.params;
  
  db.all(
    'SELECT * FROM tasks WHERE project_id = ? ORDER BY status, position, created_at',
    [project_id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Group tasks by status
      const kanbanBoard = {};
      KANBAN_COLUMNS.forEach(column => {
        kanbanBoard[column] = rows.filter(task => task.status === column);
      });
      
      res.json(kanbanBoard);
    }
  );
});

module.exports = router; 