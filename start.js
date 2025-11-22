#!/usr/bin/env node

/**
 * TigerTime - One-click startup script
 * Starts the server and opens the app in your browser
 */

import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer } from 'http';
import open from 'open';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static HTML file
app.use(express.static(__dirname));

// In-memory cache for events
let eventsCache = [];

// Load events from JSON file
async function loadEvents() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'events.json'), 'utf-8');
    eventsCache = JSON.parse(data);
    console.log(`Loaded ${eventsCache.length} events`);
  } catch (error) {
    console.error('Error loading events:', error);
    eventsCache = [];
  }
}

// Initialize events on startup
loadEvents();

// GET /api/events - Return all events
app.get('/api/events', async (req, res) => {
  try {
    res.json({
      success: true,
      count: eventsCache.length,
      events: eventsCache
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/events/:id - Return specific event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = eventsCache.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/scrape - Run scraper with credentials
app.post('/api/scrape', async (req, res) => {
  try {
    const { netid, password } = req.body;

    if (!netid || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing NetID or password'
      });
    }

    console.log(`Running scraper for user: ${netid}`);

    // Store the old events file timestamp to detect if it was updated
    let oldTimestamp = null;
    try {
      const stats = await fs.stat(path.join(__dirname, 'events.json'));
      oldTimestamp = stats.mtime.getTime();
    } catch (err) {
      // File doesn't exist yet
    }

    // Run the scraper with credentials as environment variables
    let stdout, stderr;
    try {
      const result = await execAsync(
        `PRINCETON_NETID="${netid}" PRINCETON_PASSWORD="${password}" node scrape-now.js`,
        {
          cwd: __dirname,
          timeout: 120000 // 2 minute timeout
        }
      );
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError) {
      // Scraper failed - check if it's an authentication error
      const output = execError.stdout || '';
      const errorOutput = execError.stderr || '';

      console.log('Scraper failed with output:', output);
      console.error('Scraper error output:', errorOutput);

      if (output.includes('Authentication failed') || errorOutput.includes('Authentication failed')) {
        throw new Error('Authentication failed: Invalid NetID or password');
      }

      throw new Error(`Scraper failed: ${execError.message}`);
    }

    console.log('Scraper output:', stdout);
    if (stderr) console.error('Scraper errors:', stderr);

    // Verify the events file was actually updated
    let newTimestamp = null;
    try {
      const stats = await fs.stat(path.join(__dirname, 'events.json'));
      newTimestamp = stats.mtime.getTime();
    } catch (err) {
      throw new Error('Scraper did not create events file');
    }

    if (oldTimestamp && newTimestamp <= oldTimestamp) {
      throw new Error('Authentication failed: Events file was not updated');
    }

    // Reload events from the newly created file
    await loadEvents();

    res.json({
      success: true,
      message: 'Events scraped successfully',
      count: eventsCache.length,
      events: eventsCache
    });

  } catch (error) {
    console.error('Scraper error:', error);

    // Check if it's an authentication error
    if (error.message && error.message.includes('Authentication failed')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid NetID or password'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape events'
    });
  }
});

// POST /api/events/refresh - Trigger scraper to refresh events
app.post('/api/events/refresh', async (req, res) => {
  try {
    // In production, you'd trigger the scraper here
    await loadEvents();
    res.json({
      success: true,
      message: 'Events refreshed',
      count: eventsCache.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/calendar/add - Add event to Google Calendar
app.post('/api/calendar/add', async (req, res) => {
  try {
    const { eventId, accessToken } = req.body;

    if (!eventId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing eventId or accessToken'
      });
    }

    // Find the event
    const event = eventsCache.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Initialize Google Calendar API with user's access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Parse datetime (this is a simplified version - you'll need to adjust based on actual format)
    const startDateTime = new Date(event.datetime || Date.now());
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    // Create calendar event
    const calendarEvent = {
      summary: event.name,
      location: event.location || '',
      description: event.description || `Hosted by: ${event.host_organization || 'Unknown'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: calendarEvent,
    });

    res.json({
      success: true,
      message: 'Event added to calendar',
      calendarEventId: response.data.id,
      htmlLink: response.data.htmlLink
    });

  } catch (error) {
    console.error('Error adding to calendar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', events: eventsCache.length });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║            🎓 TigerTime Started! 🎓            ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Events API: http://localhost:${PORT}/api/events`);
  console.log(`🌐 Web App: http://localhost:${PORT}/tigertime.html\n`);

  // Open browser automatically
  try {
    console.log('🌐 Opening browser...\n');
    await open(`http://localhost:${PORT}/tigertime.html`);
    console.log('✅ Browser opened successfully!\n');
    console.log('Press Ctrl+C to stop the server\n');
  } catch (error) {
    console.error('❌ Could not open browser automatically');
    console.log(`Please open http://localhost:${PORT}/tigertime.html manually\n`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down TigerTime...');
  server.close(() => {
    console.log('✅ Server stopped\n');
    process.exit(0);
  });
});