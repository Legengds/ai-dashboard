import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dashboard-legengds.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Setup endpoint - create table if not exists
  if (req.url === '/api/setup') {
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS tracking_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          widget TEXT NOT NULL,
          element TEXT,
          timestamp INTEGER NOT NULL,
          duration INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return res.status(200).json({ success: true, message: 'Table created' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  const { method, query, body } = req;

  try {
    if (method === 'GET' && !query.widget) {
      const result = await client.execute('SELECT * FROM tracking_events ORDER BY timestamp DESC');
      return res.status(200).json({ events: result.rows });
    }

    if (method === 'GET' && query.widget) {
      const result = await client.execute({
        sql: 'SELECT * FROM tracking_events WHERE widget = ? ORDER BY timestamp DESC',
        args: [query.widget]
      });
      return res.status(200).json({ events: result.rows });
    }

    if (method === 'POST') {
      const { eventType, widget, element, timestamp, duration } = body;
      
      if (!eventType || !widget || !timestamp) {
        return res.status(400).json({ 
          error: 'Missing required fields: eventType, widget, timestamp' 
        });
      }

      const result = await client.execute({
        sql: `INSERT INTO tracking_events (event_type, widget, element, timestamp, duration) VALUES (?, ?, ?, ?, ?)`,
        args: [eventType, widget, element || null, timestamp, duration || null]
      });
      
      return res.status(201).json({ success: true, id: result.lastInsertRowid });
    }

    if (method === 'DELETE') {
      await client.execute('DELETE FROM tracking_events');
      return res.status(200).json({ success: true, message: 'All tracking events cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
