# 🚀 Deployment Guide - Princeton Events System

This guide will help you deploy the system in **under 4 hours** and get it working end-to-end.

## ⏱️ Time Breakdown (4 hours total)

- **Hour 1**: Setup & Authentication (30 min scraper, 30 min Google Calendar)
- **Hour 2**: Backend deployment & testing
- **Hour 3**: Frontend integration & styling
- **Hour 4**: Testing, debugging, and polish

---

## 🔥 Quick Start (Choose One Path)

### Path A: Local Development (Fastest)
Best for testing and iteration. No deployment needed.

### Path B: Production Deployment
Deploy backend to Railway/Render, frontend to Vercel.

---

## 📋 Hour 1: Setup & Authentication

### Step 1.1: Get the Code Working Locally (15 min)

```bash
# Clone/navigate to project
cd event-scraper

# Install dependencies
npm install

# Test the scraper
npm run scrape
```

**Expected Output**: `events.json` file created with event data

**If scraper fails** (Princeton requires auth):
1. Log into https://my.princeton.edu/events in Chrome
2. Open DevTools (F12) → Application → Cookies
3. Copy your session cookie
4. Add to scraper.js:

```javascript
// In scraper.js, before page.goto()
await page.setCookie({
  name: 'session_name',  // Find actual cookie name in DevTools
  value: 'your_session_value',
  domain: '.princeton.edu'
});
```

### Step 1.2: Start Backend (5 min)

```bash
# In one terminal
npm run server
```

Test: Visit http://localhost:3001/api/events - should return JSON

### Step 1.3: Google Calendar Setup (30 min)

#### A. Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create new project: "Princeton Events Calendar"
3. Enable APIs:
   - Click "Enable APIs and Services"
   - Search for "Google Calendar API"
   - Click "Enable"

#### B. Create OAuth Credentials

1. Go to "Credentials" in left sidebar
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen (if first time):
   - User Type: External
   - App name: Princeton Events
   - User support email: your email
   - Developer email: your email
   - Click Save
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: Princeton Events Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:3001`
   - Authorized redirect URIs:
     - `http://localhost:3000`
   - Click Create

5. **SAVE THE CLIENT ID** - you'll need it!

#### C. Add to Frontend

Install Google OAuth library:
```bash
npm install @react-oauth/google
```

Wrap your app with OAuth provider (in your main App.js):

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID_HERE">
      <EventsApp />
    </GoogleOAuthProvider>
  );
}
```

#### D. Update EventsApp.jsx

Add this component at the top of the events list:

```jsx
import { useGoogleLogin } from '@react-oauth/google';

// Inside EventsApp component
const [isAuthenticated, setIsAuthenticated] = useState(false);

const login = useGoogleLogin({
  onSuccess: (tokenResponse) => {
    localStorage.setItem('google_access_token', tokenResponse.access_token);
    setIsAuthenticated(true);
    alert('Connected to Google Calendar!');
  },
  scope: 'https://www.googleapis.com/auth/calendar'
});

// Add this before the events list
{!isAuthenticated && (
  <div className="bg-orange-600 text-white p-4 rounded-lg mb-6 text-center">
    <p className="mb-2">Connect your Google Calendar to add events</p>
    <button
      onClick={() => login()}
      className="px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100"
    >
      Connect Google Calendar
    </button>
  </div>
)}
```

---

## ⚡ Hour 2: Backend Deployment & Testing

### Option 1: Deploy to Railway (Easiest)

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your repo
5. Railway will auto-detect Node.js
6. Add environment variables:
   - `PORT=3001`
7. Deploy!

Railway will give you a URL like: `https://your-app.up.railway.app`

### Option 2: Deploy to Render

1. Go to https://render.com/
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm run server`
5. Add environment variables
6. Deploy!

### Testing Backend

```bash
# Test the deployed API
curl https://your-backend-url.com/api/events

# Should return JSON with events
```

---

## 🎨 Hour 3: Frontend Integration

### Step 3.1: Update Backend URL

In EventsApp.jsx, change:

```javascript
const BACKEND_URL = 'https://your-backend-url.com'; // Your Railway/Render URL
```

### Step 3.2: Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow prompts, and you'll get a URL like: `https://your-app.vercel.app`

#### Option B: Netlify

1. Build your React app: `npm run build`
2. Go to https://netlify.com/
3. Drag and drop your `build` folder
4. Done!

### Step 3.3: Update Google OAuth

1. Go back to Google Cloud Console
2. Credentials → Edit your OAuth client
3. Add production URLs:
   - Authorized origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-app.vercel.app`
4. Save

---

## 🧪 Hour 4: Testing & Polish

### Checklist

- [ ] Events load from backend
- [ ] Images display correctly
- [ ] "Add to Calendar" button works
- [ ] Google OAuth authentication works
- [ ] Events appear in Google Calendar
- [ ] Mobile responsive
- [ ] Error handling works

### Common Issues & Fixes

#### Issue: CORS errors
**Fix**: Add frontend URL to CORS whitelist in server.js:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app']
}));
```

#### Issue: Images not loading
**Fix**: Check image URLs in events.json. Use placeholder if broken:

```javascript
// In EventsApp.jsx
<img
  src={event.cover_image || 'https://via.placeholder.com/400x300?text=Event'}
  alt={event.name}
/>
```

#### Issue: Calendar not working
**Fix**: Check browser console for errors. Verify:
1. Access token is being saved to localStorage
2. Token is being sent in API request
3. Google Calendar API is enabled

#### Issue: No events showing
**Fix**: 
1. Check backend logs
2. Verify events.json exists and has data
3. Test API endpoint directly

---

## 🔄 Automation Setup

### Schedule Daily Scraping

#### Option 1: Cron Job (if you have a server)

```bash
# Edit crontab
crontab -e

# Add this line (runs at 6 AM daily)
0 6 * * * cd /path/to/event-scraper && npm run scrape
```

#### Option 2: GitHub Actions (Free)

Create `.github/workflows/scrape.yml`:

```yaml
name: Scrape Events

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scrape
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add events.json
          git commit -m "Update events" || exit 0
          git push
```

#### Option 3: Railway Cron Job

Add to `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run server",
    "restartPolicyType": "ON_FAILURE"
  },
  "cron": [
    {
      "schedule": "0 6 * * *",
      "command": "npm run scrape"
    }
  ]
}
```

---

## 📊 Monitoring & Maintenance

### Check Backend Health

```bash
curl https://your-backend-url.com/health
```

### View Logs

**Railway**: Dashboard → Deployments → Logs
**Render**: Dashboard → Your Service → Logs

### Update Events Manually

```bash
# SSH into your server or run locally
npm run scrape

# Or trigger via API
curl -X POST https://your-backend-url.com/api/events/refresh
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Implement rate limiting (optional):

```javascript
// In server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

- [ ] Validate user inputs
- [ ] Keep dependencies updated: `npm audit fix`

---

## 🎯 Success Criteria

Your system is working when:

1. ✅ You can visit your frontend URL
2. ✅ Events load and display with images
3. ✅ You can click "Connect Google Calendar" and authenticate
4. ✅ You can click "Add to Calendar" and event appears in Google Calendar
5. ✅ Backend API responds at `/api/events`
6. ✅ Scraper runs and updates events.json

---

## 🆘 Emergency Troubleshooting

### Nothing works?

1. **Start simple**: Get `events.json` manually working first
2. **Test locally**: Make sure everything works on localhost
3. **Check logs**: Backend logs will show errors
4. **One thing at a time**: Don't deploy everything at once

### Still stuck?

1. Check that mock data works (use included events.json)
2. Comment out Google Calendar integration initially
3. Focus on just displaying events first
4. Add features one by one

---

## 📱 Mobile Testing

Test on phone:
1. Use ngrok for local testing: `ngrok http 3001`
2. Or deploy and test production URL
3. Check responsive design
4. Test touch interactions

---

## 🚀 Going Further (Post-Launch)

1. **Add search/filter**: Filter by tags, dates, location
2. **Add notifications**: Email reminders for events
3. **User accounts**: Let users save favorite events
4. **Analytics**: Track which events are popular
5. **Admin panel**: Interface to manually add/edit events

---

## 📞 Quick Reference

```bash
# Development
npm run scrape          # Scrape events
npm run server          # Start backend
npm start              # Start frontend (in React app)

# Production
git push               # Deploy (if using auto-deploy)
vercel --prod          # Deploy frontend
railway up             # Deploy backend

# Testing
curl localhost:3001/api/events              # Local API
curl https://your-app.com/api/events        # Production API
```

---

## ✅ Final Checklist

Before showing to users:

- [ ] Test all features work
- [ ] Check on mobile device
- [ ] Verify Google Calendar integration
- [ ] Have at least 5-10 real events
- [ ] Images display correctly
- [ ] Error messages are user-friendly
- [ ] Loading states work
- [ ] Set up automated scraping

**Time to launch: 4 hours** ✨

Good luck! 🎉
