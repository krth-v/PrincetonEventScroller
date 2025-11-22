# Princeton Events Scraper & Calendar Integration

A complete system to scrape Princeton University events, serve them via API, and integrate with Google Calendar.

## 🏗️ Architecture

```
┌─────────────────┐
│  Princeton.edu  │
│   Events Page   │
└────────┬────────┘
         │
         │ Puppeteer Scraping
         ▼
┌─────────────────┐
│  scraper.js     │
│  (Node.js)      │
└────────┬────────┘
         │
         │ Writes JSON
         ▼
┌─────────────────┐
│  events.json    │
└────────┬────────┘
         │
         │ Read by
         ▼
┌─────────────────┐       ┌──────────────────┐
│   server.js     │◄──────┤  EventsApp.jsx   │
│  (Express API)  │       │  (React Frontend)│
└────────┬────────┘       └──────────────────┘
         │
         │ Google Calendar API
         ▼
┌─────────────────┐
│ Google Calendar │
└─────────────────┘
```

## 📋 Features

- ✅ Scrapes events from Princeton events page
- ✅ Extracts: name, location, date/time, host, RSVPs, tags, cover images
- ✅ REST API for frontend consumption
- ✅ Google Calendar integration
- ✅ Scrollable React UI with event cards

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Scrape Events

```bash
npm run scrape
```

This will:
- Launch a headless browser
- Navigate to Princeton events page
- Extract all event data
- Save to `events.json`

### 3. Start the Backend Server

```bash
npm run server
```

Server will run on `http://localhost:3001`

### 4. Use the React Frontend

Import the `EventsApp.jsx` component into your React application:

```jsx
import EventsApp from './EventsApp';

function App() {
  return <EventsApp />;
}
```

## 📡 API Endpoints

### GET `/api/events`
Returns all events in JSON format.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "events": [
    {
      "id": "event_1234567890_0",
      "name": "Event Name",
      "location": "Frist Campus Center",
      "datetime": "Nov 25, 2024 at 6:00 PM",
      "host_organization": "Princeton ACM",
      "rsvp_list": ["John Doe", "Jane Smith"],
      "tags": ["Technology", "Workshop"],
      "cover_image": "https://...",
      "description": "Event description..."
    }
  ]
}
```

### GET `/api/events/:id`
Returns a specific event by ID.

### POST `/api/events/refresh`
Triggers reload of events from JSON file.

### POST `/api/calendar/add`
Adds an event to user's Google Calendar.

**Request Body:**
```json
{
  "eventId": "event_1234567890_0",
  "accessToken": "user's Google OAuth access token"
}
```

## 🔧 Google Calendar Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### 2. Implement OAuth Flow (Frontend)

You need to add Google Sign-In to your frontend:

```jsx
// Add to your React app
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

function GoogleCalendarAuth() {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      console.log('Authenticated with Google!');
    },
    scope: 'https://www.googleapis.com/auth/calendar'
  });

  return (
    <button onClick={() => login()}>
      Connect Google Calendar
    </button>
  );
}
```

### 3. Environment Variables

Create `.env` file:

```env
# Google Calendar API (optional - for server-side OAuth)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# Server
PORT=3001
```

## 📝 Data Schema

Each event object contains:

```typescript
interface Event {
  id: string;                    // Unique identifier
  name: string | null;           // Event title
  location: string | null;       // Physical location
  datetime: string | null;       // Date and time
  host_organization: string | null;  // Hosting group
  rsvp_list: string[];          // List of attendees
  tags: string[];               // Category tags
  cover_image: string | null;   // Image URL
  description: string | null;   // Event description
}
```

## 🔄 Scraper Customization

The scraper uses flexible selectors to find event data. If Princeton changes their page structure, update the selectors in `scraper.js`:

```javascript
// Customize these arrays to match the page structure
const titleSelectors = ['h1', 'h2', 'h3', '[class*="title"]'];
const locationSelectors = ['[class*="location"]', '[class*="venue"]'];
// ... etc
```

## ⚠️ Important Notes

### Authentication Required
- The Princeton events page may require authentication
- You might need to add cookie handling to the scraper:

```javascript
// Add to scraper.js before page.goto()
await page.setCookie({
  name: 'session_cookie',
  value: 'your_session_value',
  domain: '.princeton.edu'
});
```

### Rate Limiting
- Respect Princeton's servers
- Add delays between requests
- Consider caching scraped data

### Production Considerations
1. **Scheduled Scraping**: Use cron jobs to refresh events regularly
2. **Database**: Store events in MongoDB/PostgreSQL instead of JSON
3. **Error Handling**: Add retry logic and monitoring
4. **Image Optimization**: Cache and resize event images
5. **CORS**: Configure properly for production domains

## 🕒 Automation

Set up a cron job to refresh events daily:

```bash
# Add to crontab (run at 6 AM daily)
0 6 * * * cd /path/to/project && npm run scrape
```

Or use node-cron in server.js:

```javascript
import cron from 'node-cron';

// Run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running scheduled event scrape...');
  // Execute scraper
});
```

## 🐛 Troubleshooting

### Scraper returns empty array
- Check if page requires authentication
- Inspect the actual HTML structure: `view-source:https://my.princeton.edu/events`
- Update CSS selectors in scraper.js

### CORS errors
- Ensure backend server has CORS enabled
- Check frontend is using correct backend URL
- Add your frontend domain to CORS whitelist

### Google Calendar not working
- Verify OAuth scope includes calendar access
- Check access token is valid and not expired
- Ensure Calendar API is enabled in Google Cloud Console

## 📦 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, or AWS
- Set environment variables
- Ensure Puppeteer dependencies are installed

### Frontend (React)
- Deploy to: Vercel, Netlify, or AWS S3
- Update `BACKEND_URL` in EventsApp.jsx
- Build: `npm run build`

## 🔐 Security

- Never commit OAuth credentials
- Use environment variables for secrets
- Implement rate limiting on API endpoints
- Validate and sanitize user inputs
- Use HTTPS in production

## 📞 Support

For issues with:
- **Scraping**: Check Princeton's robots.txt and terms of service
- **Google Calendar**: See [Google Calendar API docs](https://developers.google.com/calendar)
- **React Frontend**: Ensure you have Tailwind CSS configured

## 📄 License

MIT License - Feel free to use and modify for your needs.
