# 🚀 Quick Reference Card

## ⚡ Fastest Way to Start (5 minutes)

```bash
# Ignore npm warnings - they're not critical!
npm install
npm run server
open demo.html
```

✅ **Done!** You have a working system with sample events.

---

## 🔥 Common Commands

```bash
# Start the backend server
npm run server

# Fetch real Princeton events (interactive)
npm run auth

# Test the API
curl http://localhost:3001/api/events

# Open the demo
open demo.html
```

---

## 📚 Which Guide to Read?

| I want to... | Read this |
|-------------|-----------|
| **Start right now** | [NPM-WARNINGS-FIX.md](./NPM-WARNINGS-FIX.md) then [QUICKSTART.md](./QUICKSTART.md) |
| **Get real Princeton events** | [PRINCETON-AUTH.md](./PRINCETON-AUTH.md) |
| **Connect my React app** | [FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md) |
| **Deploy to production** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| **Understand the system** | [COMPLETE-OVERVIEW.md](./COMPLETE-OVERVIEW.md) |

---

## 🐛 Troubleshooting

### NPM Warnings?
→ [NPM-WARNINGS-FIX.md](./NPM-WARNINGS-FIX.md)

### Backend won't start?
```bash
# Check if port is in use
lsof -i :3001

# Use different port
PORT=3002 npm run server
```

### No events showing?
```bash
# Check events.json exists
cat events.json

# Test API directly
curl http://localhost:3001/api/events
```

### Authentication issues?
→ [PRINCETON-AUTH.md](./PRINCETON-AUTH.md) - Troubleshooting section

---

## 🎯 Two Main Paths

### Path A: Quick Development (Recommended)
```
1. npm install (ignore warnings)
2. npm run server
3. open demo.html
4. ✅ Build your frontend with sample data
```

### Path B: Real Princeton Events
```
1. npm install (ignore warnings)
2. npm run auth (enter NetID/password)
3. npm run server
4. open demo.html
5. ✅ Your app now shows real events!
```

---

## 📡 API Endpoints

```
GET  /api/events          → All events
GET  /api/events/:id      → Single event
POST /api/calendar/add    → Add to calendar
GET  /health              → Server health
```

---

## 🔧 Quick Fixes

### Skip Puppeteer Warnings
```bash
# Use minimal package (no browser automation)
cp package-minimal.json package.json
rm -rf node_modules package-lock.json
npm install
```

### Update All Packages
```bash
npm update
```

### Fresh Install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Frontend Options

| Option | File | Setup Time |
|--------|------|------------|
| Standalone Demo | demo.html | 0 min (just open it) |
| React Component | EventsApp.jsx | 5 min |
| Next.js | See guide | 15 min |
| Custom | Use API | Varies |

---

## ✅ System Check

Everything is working if:
- [ ] `npm run server` starts without errors
- [ ] `curl http://localhost:3001/api/events` returns JSON
- [ ] `demo.html` displays events
- [ ] Events have names, dates, locations

---

## 💡 Pro Tips

1. **Ignore Puppeteer warnings** - Not critical for development
2. **Use sample data first** - Get UI working quickly
3. **Add real data later** - When you have time
4. **Don't fight automation** - Manual extraction is faster
5. **Focus on frontend** - That's where users see value

---

## 📞 Need Help Fast?

1. **Read**: [NPM-WARNINGS-FIX.md](./NPM-WARNINGS-FIX.md) - Solves most issues
2. **Check**: [QUICKSTART.md](./QUICKSTART.md) - Basic setup
3. **Search**: Press Ctrl+F in any guide

---

## 🎉 Success Checklist

- [ ] Backend running: `npm run server` ✅
- [ ] API responding: `curl localhost:3001/api/events` ✅
- [ ] Frontend working: `open demo.html` ✅
- [ ] Events displaying with data ✅
- [ ] Ready to develop! ✅

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install & start server | 2 min |
| Open demo | 1 min |
| Test API | 1 min |
| **Total to working system** | **5 min** |
| Add Princeton auth | +5 min |
| Customize frontend | +2 hours |
| Deploy to production | +1 hour |
| **Total to production** | **~4 hours** |

---

## 🚀 You're Ready!

**Just run these 3 commands:**
```bash
npm install
npm run server
open demo.html
```

**Time to working demo: 5 minutes!** ⚡

See you on the other side! 🎉
