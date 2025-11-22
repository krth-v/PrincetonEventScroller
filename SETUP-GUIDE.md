# 🚀 Quick Setup - You're Almost There!

## The Issue

You're in `/Users/krutharthnon-admin/Downloads/files/` but the files are in the Claude outputs.

## ✅ Solution (2 minutes)

### Step 1: Download All Files

All your project files are available in the outputs folder. You need to download them to your computer.

### Step 2: Navigate to Your Project Folder

```bash
# Go to where you downloaded the files
cd ~/Downloads/princeton-events

# Or wherever you saved them
```

### Step 3: Verify Files Are There

```bash
# Check if package.json exists
ls package.json

# You should see all these files:
ls *.js *.jsx *.json *.html
```

### Step 4: Install and Run

```bash
npm install
npm run server
```

---

## 🎯 Fastest Way to Get Started

If you just want to start building NOW without worrying about downloads:

### Create a New Project From Scratch:

```bash
# 1. Create project folder
mkdir princeton-events
cd princeton-events

# 2. Create package.json
cat > package.json << 'EOF'
{
  "name": "princeton-events-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "server": "node server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "cors": "^2.8.5",
    "googleapis": "^144.0.0",
    "dotenv": "^16.4.5"
  }
}
EOF

# 3. Create server.js (basic version)
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let eventsCache = [];

async function loadEvents() {
  try {
    const data = await fs.readFile('events.json', 'utf-8');
    eventsCache = JSON.parse(data);
    console.log(`Loaded ${eventsCache.length} events`);
  } catch (error) {
    console.error('Error loading events:', error);
    eventsCache = [];
  }
}

loadEvents();

app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    count: eventsCache.length,
    events: eventsCache
  });
});

app.get('/api/events/:id', (req, res) => {
  const event = eventsCache.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }
  res.json({ success: true, event });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', events: eventsCache.length });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# 4. Create events.json with sample data
cat > events.json << 'EOF'
[
  {
    "id": "event_1",
    "name": "ACM Workshop: Machine Learning Basics",
    "location": "Friend Center 101",
    "datetime": "November 25, 2024 at 6:00 PM",
    "host_organization": "Princeton ACM",
    "rsvp_list": ["John Smith", "Jane Doe", "Alex Johnson"],
    "tags": ["Technology", "Workshop", "AI"],
    "cover_image": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
    "description": "Introduction to machine learning fundamentals with hands-on exercises."
  },
  {
    "id": "event_2",
    "name": "Fall Cultural Festival",
    "location": "Frist Campus Center",
    "datetime": "November 26, 2024 at 7:30 PM",
    "host_organization": "International Student Association",
    "rsvp_list": ["Maria Garcia", "Ahmed Hassan", "Li Wei"],
    "tags": ["Cultural", "Food", "Performance"],
    "cover_image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    "description": "Celebrate diversity with performances and food from around the world."
  }
]
EOF

# 5. Install and run
npm install
npm run server
```

**Done! Server running on http://localhost:3001**

---

## 🌐 Create a Simple Frontend

```bash
# Create demo.html
cat > demo.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Princeton Events</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .event { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .event h2 { color: #e97451; margin: 0 0 10px 0; }
    .event img { max-width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>🎓 Princeton Events</h1>
  <div id="events"></div>
  
  <script>
    fetch('http://localhost:3001/api/events')
      .then(r => r.json())
      .then(data => {
        const container = document.getElementById('events');
        data.events.forEach(event => {
          container.innerHTML += `
            <div class="event">
              ${event.cover_image ? `<img src="${event.cover_image}" alt="${event.name}">` : ''}
              <h2>${event.name}</h2>
              <p>📅 ${event.datetime}</p>
              <p>📍 ${event.location}</p>
              <p>👥 ${event.host_organization}</p>
              <p>${event.description}</p>
            </div>
          `;
        });
      });
  </script>
</body>
</html>
EOF

# Open it
open demo.html
```

---

## 🎯 To Get Real Princeton Events

### Method 1: Browser Console (Easiest)

1. Open https://my.princeton.edu/events in browser
2. Log in with NetID
3. Press F12 → Console
4. Paste this:

```javascript
const events = [];
document.querySelectorAll('[class*="event"], article').forEach((card, i) => {
  events.push({
    id: `event_${i}`,
    name: card.querySelector('h1, h2, h3')?.textContent?.trim() || 'Event',
    location: card.querySelector('[class*="location"]')?.textContent?.trim(),
    datetime: card.querySelector('[class*="date"], time')?.textContent?.trim(),
    host_organization: card.querySelector('[class*="host"]')?.textContent?.trim(),
    description: card.querySelector('p')?.textContent?.trim(),
    cover_image: card.querySelector('img')?.src,
    tags: [],
    rsvp_list: []
  });
});

const blob = new Blob([JSON.stringify(events, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'events.json';
a.click();
console.log(`Downloaded ${events.length} events!`);
```

5. Save the downloaded file as `events.json` in your project folder
6. Restart server: `npm run server`

---

## ✅ Checklist

After setup, you should have:
- [ ] package.json
- [ ] server.js
- [ ] events.json (with sample or real data)
- [ ] demo.html
- [ ] node_modules/ (after npm install)

Then:
```bash
npm run server
open demo.html
```

---

## 📞 Quick Commands

```bash
# Check you're in the right directory
ls package.json

# If you see "No such file", you're in the wrong place
cd ~/Downloads/princeton-events  # or wherever you saved files

# Install dependencies
npm install

# Start server
npm run server

# Test API
curl http://localhost:3001/api/events

# Open frontend
open demo.html
```

---

## 🎉 You're Ready!

Once you have the files in the right directory and run `npm install`, everything will work!

**Time to working system: 5 minutes**
