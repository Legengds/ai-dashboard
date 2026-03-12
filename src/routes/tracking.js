const express = require('express');
const db = require('../db');

const router = express.Router();

// POST /api/tracking - Receive tracking event
router.post('/', (req, res) => {
  try {
    const { eventType, widget, element, timestamp, duration } = req.body;
    
    if (!eventType || !widget || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: eventType, widget, timestamp' 
      });
    }

    const stmt = db.prepare(`
      INSERT INTO tracking_events (event_type, widget, element, timestamp, duration)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(eventType, widget, element || null, timestamp, duration || null);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error inserting tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tracking - Get all tracking events
router.get('/', (req, res) => {
  try {
    const { widget } = req.query;
    
    let sql = 'SELECT * FROM tracking_events';
    let params = [];
    
    if (widget) {
      sql += ' WHERE widget = ?';
      params.push(widget);
    }
    
    sql += ' ORDER BY timestamp DESC';
    
    const stmt = db.prepare(sql);
    const events = params.length ? stmt.all(...params) : stmt.all();
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tracking/:widget - Get events for specific widget
router.get('/:widget', (req, res) => {
  try {
    const { widget } = req.params;
    const stmt = db.prepare('SELECT * FROM tracking_events WHERE widget = ? ORDER BY timestamp DESC');
    const events = stmt.all(widget);
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tracking - Clear all tracking events
router.delete('/', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM tracking_events');
    stmt.run();
    
    res.json({ success: true, message: 'All tracking events cleared' });
  } catch (error) {
    console.error('Error clearing tracking events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
