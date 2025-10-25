# Quick Start Guide 🚀

## Immediate Usage (Right Now!)

### 1. Start the Server (5 seconds)
The server is already running on port 3006!

If not, run:
```bash
cd C:\Users\iamam\Ibba-Games-To-Schedule
node server.js
```

### 2. Access the App
Open your browser: **`http://localhost:3006`**

### 3. Login
- Enter your referee number: `19279`
- Enter your password: `311098`
- Click "כניסה"

### 4. Scrape Games
- Click "עדכן יומן משחקים"
- Wait ~10 seconds
- See results!

### 5. View Stored Data
- Click "צפה בנתונים"
- See all scraped games

---

## Current Features Working ✅

- ✅ **Web scraping**: Extracts games from judge.ibasketball.co.il
- ✅ **Data storage**: Saves to `games-data.json`
- ✅ **Change detection**: Shows added/removed games
- ✅ **Clean names**: "כפר סבא - עמק חפר [נוער על]"
- ✅ **Pagination**: Scrapes all pages automatically

---

## To Add Google Calendar (Optional, 30 min)

### Step 1: Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Create project: "Basketball Scheduler"
3. Enable "Google Calendar API"
4. Create OAuth credentials (Web application)
5. Add redirect URI: `http://localhost:3006`

### Step 2: Update Config
Edit `config.js`:
```javascript
GOOGLE_API: {
    API_KEY: 'YOUR_KEY_HERE',
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE'
}
```

### Step 3: Test
1. Restart server: `node server.js`
2. Open http://localhost:3006
3. Click "התחברות ל-Google"
4. Authorize calendar access
5. Scrape games
6. Check your Google Calendar!

**Full guide**: See `GOOGLE-CALENDAR-SETUP.md`

---

## To Run as Background Service (15 min)

### Option A: PM2 (Recommended)
```bash
npm install -g pm2
cd C:\Users\iamam\Ibba-Games-To-Schedule
pm2 start server.js --name basketball-scheduler
pm2 startup
pm2 save
```

### Option B: Task Scheduler
1. Create `start.bat`:
```batch
cd C:\Users\iamam\Ibba-Games-To-Schedule
node server.js
```
2. Add to Task Scheduler → Run at startup

**Full guide**: See `PRODUCTION-DEPLOYMENT.md`

---

## Current Status 📊

✅ **Core Features**: 100% complete
- Scraping: ✅
- Data storage: ✅
- Change detection: ✅
- UI: ✅
- Production-ready: ✅

⚠️ **Optional Features**: User setup required
- Google Calendar: Needs OAuth setup (30 min)
- Auto-start service: Needs PM2 setup (15 min)

---

## Files You Have

```
├── server.js                 ⭐ Main server
├── index.html                ⭐ UI
├── script.js                 ⭐ Frontend logic
├── config.js                 ⚙️  Configuration
├── games-data.json           📁 Auto-generated data
├── QUICK-START.md            📖 This file
├── GOOGLE-CALENDAR-SETUP.md  📖 Google setup
├── PRODUCTION-DEPLOYMENT.md  📖 Deployment guide
└── FINAL-STATUS.md           📖 Complete status
```

---

## Quick Commands

### Start Server
```bash
node server.js
```

### Stop All Processes
```bash
taskkill /F /IM node.exe
taskkill /F /IM chrome.exe
```

### Check if Running
```bash
netstat -ano | findstr :3006
```

### View Data File
```bash
type games-data.json
```

---

## Troubleshooting

**Q: Chrome won't start?**
```bash
taskkill /F /IM chrome.exe
taskkill /F /IM chromedriver.exe
node server.js
```

**Q: Port 3006 in use?**
```bash
netstat -ano | findstr :3006
taskkill /F /PID <pid>
```

**Q: No data showing?**
- Make sure you scraped at least once
- Check if `games-data.json` exists

**Q: Google Calendar not working?**
- Follow `GOOGLE-CALENDAR-SETUP.md` completely
- Make sure OAuth credentials are correct
- Check browser console for errors

---

## Summary

You have a **fully functional** referee scheduling system!

**Working now**:
- ✅ Scrapes games automatically
- ✅ Stores data persistently  
- ✅ Detects changes
- ✅ Beautiful UI

**To add** (optional):
- Google Calendar sync (30 min setup)
- Auto-start on boot (15 min setup)

**Current server**: Running on http://localhost:3006

**Enjoy!** 🏀🎉

