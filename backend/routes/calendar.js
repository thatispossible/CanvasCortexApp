const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

const router = express.Router();

// GET calendar blocks for a date range
router.get('/', (req, res) => {
  const { start_date, end_date, task_id } = req.query;
  
  let query = `
    SELECT cb.*, t.title as task_title, t.project_id 
    FROM calendar_blocks cb 
    LEFT JOIN tasks t ON cb.task_id = t.id
  `;
  let params = [];
  const conditions = [];
  
  if (start_date && end_date) {
    conditions.push('cb.date BETWEEN ? AND ?');
    params.push(start_date, end_date);
  }
  
  if (task_id) {
    conditions.push('cb.task_id = ?');
    params.push(task_id);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY cb.date, cb.start_time';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET calendar blocks for a specific date
router.get('/date/:date', (req, res) => {
  const { date } = req.params;
  
  db.all(
    `SELECT cb.*, t.title as task_title, t.project_id 
     FROM calendar_blocks cb 
     LEFT JOIN tasks t ON cb.task_id = t.id 
     WHERE cb.date = ? 
     ORDER BY cb.start_time`,
    [date],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// POST create calendar block
router.post('/', (req, res) => {
  const { task_id, start_time, end_time, date, is_available, block_type } = req.body;
  const blockId = uuidv4();
  
  db.run(
    'INSERT INTO calendar_blocks (id, task_id, start_time, end_time, date, is_available, block_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [blockId, task_id, start_time, end_time, date, is_available !== false, block_type || 'task'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created block
      db.get(
        `SELECT cb.*, t.title as task_title, t.project_id 
         FROM calendar_blocks cb 
         LEFT JOIN tasks t ON cb.task_id = t.id 
         WHERE cb.id = ?`,
        [blockId],
        (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// PUT update calendar block
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { task_id, start_time, end_time, date, is_available, block_type } = req.body;
  
  db.run(
    'UPDATE calendar_blocks SET task_id = ?, start_time = ?, end_time = ?, date = ?, is_available = ?, block_type = ? WHERE id = ?',
    [task_id, start_time, end_time, date, is_available, block_type, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Calendar block not found' });
        return;
      }
      
      // Return updated block
      db.get(
        `SELECT cb.*, t.title as task_title, t.project_id 
         FROM calendar_blocks cb 
         LEFT JOIN tasks t ON cb.task_id = t.id 
         WHERE cb.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        }
      );
    }
  );
});

// DELETE calendar block
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM calendar_blocks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Calendar block not found' });
      return;
    }
    res.json({ message: 'Calendar block deleted successfully' });
  });
});

// POST mark time slot as unavailable
router.post('/unavailable', (req, res) => {
  const { start_time, end_time, date, reason } = req.body;
  const blockId = uuidv4();
  
  db.run(
    'INSERT INTO calendar_blocks (id, start_time, end_time, date, is_available, block_type) VALUES (?, ?, ?, ?, ?, ?)',
    [blockId, start_time, end_time, date, false, 'unavailable'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT * FROM calendar_blocks WHERE id = ?', [blockId], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// GET available time slots for a date range
router.get('/available', (req, res) => {
  const { start_date, end_date, duration_hours } = req.query;
  const duration = parseInt(duration_hours) || 1;
  
  // This is a simplified version - in a real app, you'd calculate available slots
  // based on working hours and existing bookings
  const workingHours = { start: 9, end: 17 };
  const availableSlots = [];
  
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  // Generate available slots (simplified logic)
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dateStr = d.toISOString().split('T')[0];
    
    for (let hour = workingHours.start; hour < workingHours.end - duration + 1; hour++) {
      availableSlots.push({
        date: dateStr,
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        end_time: `${(hour + duration).toString().padStart(2, '0')}:00`,
        duration_hours: duration
      });
    }
  }
  
  res.json(availableSlots);
});

module.exports = router; 