# TigerTime - Princeton Events Scraper

A web app that scrapes Princeton events and allows you to view and export them to Google Calendar.

## Quick Start

Just run one command:

```bash
npm start
```

This will:
1. Start the backend server
2. Automatically open the app in your browser
3. You can browse public events or log in for personalized content

## What It Does

- Scrapes events from my.princeton.edu/events
- Displays them in a beautiful interface
- Optionally logs in with Princeton CAS for personalized events and RSVP data
- Allows you to export events to Google Calendar (coming soon)

## Features

- **Public Events**: Browse public Princeton events without logging in
- **Personalized Content**: Log in to see private club events and RSVP lists
- **Real-time Scraping**: Events are scraped fresh when you log in
- **Beautiful UI**: Dark theme with Princeton orange accents
- **Event Details**: View event names, times, locations, hosts, and RSVPs

## Authentication Note

The events page (my.princeton.edu/events) is publicly accessible, so you can scrape public events without credentials. However, logging in with your NetID gives you access to:
- Private/member-only events
- Full RSVP lists
- Personalized event recommendations

## Manual Usage

If you prefer to run things separately:

```bash
# Start server only
npm run server

# Scrape events manually (will prompt for credentials if needed)
npm run get-events
```

## Requirements

- Node.js 18+
- Princeton NetID and password (optional, for personalized content)
- Internet connection

## Privacy & Security

- Credentials are never stored on disk
- Session data is cleared when you log out
- All authentication happens through official Princeton CAS (when needed)

## Troubleshooting

**Server already running?**
- Kill the existing process: `pkill -f "node start.js"`

**Browser doesn't open automatically?**
- Navigate manually to: http://localhost:3001/tigertime.html

**Authentication failing?**
- Double-check your NetID and password
- Ensure you have internet connection
- Try running `npm run get-events` manually to test

---

Built with Puppeteer, Express, and lots of Princeton orange