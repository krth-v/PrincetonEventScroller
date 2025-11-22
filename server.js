import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Events API: http://localhost:${PORT}/api/events`);
});
