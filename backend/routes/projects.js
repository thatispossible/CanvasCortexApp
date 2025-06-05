const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { generateSubtasks, scheduleTasksInCalendar } = require('../aiService');

const router = express.Router();

// GET all projects
router.get('/', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single project
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(row);
  });
});

// POST create new project with AI-generated tasks
router.post('/', async (req, res) => {
  const { name, description, start_date, end_date } = req.body;
  const projectId = uuidv4();
  
  try {
    // Create project
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO projects (id, name, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        [projectId, name, description, start_date, end_date],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Generate AI subtasks
    const generatedTasks = generateSubtasks(name, description);
    
    // Insert tasks into database
    for (const task of generatedTasks) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO tasks (id, project_id, title, description, complexity_level, estimated_hours, status, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [task.id, projectId, task.title, task.description, task.complexity_level, task.estimated_hours, task.status, task.position],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    // Schedule tasks in calendar if dates are provided
    if (start_date && end_date) {
      // Get unavailable blocks
      const unavailableBlocks = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM calendar_blocks WHERE is_available = 0', (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      const scheduledBlocks = scheduleTasksInCalendar(generatedTasks, start_date, end_date, unavailableBlocks);
      
      // Insert calendar blocks
      for (const block of scheduledBlocks) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO calendar_blocks (id, task_id, start_time, end_time, date, is_available, block_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [block.id, block.task_id, block.start_time, block.end_time, block.date, block.is_available, block.block_type],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }
    
    // Return created project with tasks
    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const tasks = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE project_id = ? ORDER BY position', [projectId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.status(201).json({ project, tasks });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update project
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date } = req.body;
  
  db.run(
    'UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?',
    [name, description, start_date, end_date, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json({ message: 'Project updated successfully' });
    }
  );
});

// DELETE project
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    // Delete calendar blocks for project tasks
    db.run('DELETE FROM calendar_blocks WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?)', [id]);
    
    // Delete tasks
    db.run('DELETE FROM tasks WHERE project_id = ?', [id]);
    
    // Delete project
    db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json({ message: 'Project deleted successfully' });
    });
  });
});

module.exports = router; 