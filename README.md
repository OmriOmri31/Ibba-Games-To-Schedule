# 🏀 Basketball Referee Scheduler

A Progressive Web App (PWA) for basketball referees to automatically scrape their game schedule from judge.ibasketball.co.il and sync it with Google Calendar.

## ✨ Features

- 🔐 **Secure Login** - Save your credentials locally
- 🌐 **Web Scraping** - Automatically fetch your game schedule using Selenium
- 📅 **Date Filtering** - Shows games from today to one year ahead
- 📄 **Smart Pagination** - Automatically scrapes all pages using content comparison
- 🏷️ **Clean Team Names** - Extracts team names without ID numbers
- 📱 **Cross-Platform PWA** - Works on Android, iOS, Windows, Mac, Linux
- 💾 **Local Storage** - Saves game data as JSON with change detection
- 📅 **Google Calendar Sync** - Automatically creates/updates/deletes calendar events
- 🔄 **Smart Comparison** - Detects added and removed games
- 🎨 **Modern Hebrew UI** - Beautiful, responsive RTL interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **Google Chrome** browser installed
- **npm** (comes with Node.js)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
node server.js
```

3. **Open in browser:**
```
http://localhost:3006
```

## 📖 How to Use

### First Time Setup

1. Open `http://localhost:3006`
2. **Enter your credentials:**
   - Referee Number: Your judge.ibasketball.co.il referee number
   - Password: Your judge.ibasketball.co.il password
3. **Connect Google Calendar:**
   - Click "התחברות ל-Google"
   - Sign in with your Google account
   - Allow Calendar and Email permissions
   - OR click "דלג" to skip Google integration

### Scraping & Syncing Games

1. Click **"עדכן יומן משחקים"**
2. Wait 10-30 seconds while the app:
   - Opens Chrome (headless)
   - Logs into judge.ibasketball.co.il
   - Scrapes all game pages
   - Compares with previous data
   - Updates Google Calendar (if connected)
3. View results showing added/removed games
4. Games are saved locally in `games-data.json`

### Viewing Saved Data

- Click **"צפה בנתונים"** to see all scraped games
- Data persists between sessions
- Automatically detects changes on next scrape

## 🔧 Configuration

Edit `config.js` to customize:

```javascript
module.exports = {
    ENABLE_REAL_SCRAPING: true,
    TEST_CREDENTIALS: ['12345', 'test123'],
    GOOGLE_API: {
        API_KEY: 'your-api-key',
        CLIENT_ID: 'your-client-id'
    },
    SELENIUM: {
        HEADLESS: true,
        TIMEOUT: 30000,
        BASE_URL: 'https://judge.ibasketball.co.il'
    }
};
```

### Test Mode

Use test credentials to try the app without real scraping:
- Username: `12345`
- Password: `test123`
- Returns 2 mock games

## 📁 Project Structure

```
├── server.js                    # Express server + Selenium scraping
├── script.js                    # Frontend logic + Google Calendar API
├── index.html                   # PWA interface
├── styles.css                   # Styling (RTL, responsive)
├── config.js                    # Configuration
├── manifest.json                # PWA manifest
├── sw.js                        # Service worker
├── package.json                 # Dependencies
├── games-data.json              # Scraped games (auto-generated)
├── icon-192.png, icon-512.png  # App icons
├── README.md                    # This file
├── GOOGLE-CALENDAR-SETUP.md    # Google API setup guide
├── PRODUCTION-DEPLOYMENT.md    # Deployment instructions
├── QUICK-START.md              # Quick reference
└── TODO.md                     # Future enhancements
```

## 🛠️ Technical Details

### Backend
- **Express.js** - Web server (port 3006)
- **Selenium WebDriver** - Browser automation
- **ChromeDriver** - Headless Chrome for scraping
- **Smart pagination** - Content comparison to detect last page

### Frontend
- **Vanilla JavaScript** - No frameworks
- **Google Identity Services** - OAuth 2.0 for Calendar API
- **Progressive Web App** - Installable, offline-capable
- **Service Worker** - Caching

### Scraping Process
1. Opens Chrome in headless mode
2. Logs into judge.ibasketball.co.il
3. Navigates to games page (handles redirects)
4. Sets date filters (today to +1 year)
5. Scrapes all rows from all pages
6. Extracts clean team/league names
7. Compares with previous data
8. Returns changes (added/removed)

### Google Calendar Integration
- Uses Google Identity Services OAuth 2.0
- Scopes: Calendar + Email
- Token persists for 1 hour in localStorage
- Creates events with format: `Team1 - Team2 [League]`
- Includes date, time, and address

## 🐛 Troubleshooting

### Scraping Issues
- **"Table not found"**: The website structure changed. Check selector: `table tbody tr`
- **Lands on wrong page**: The fix handles `#!/personal` redirects automatically
- **Timeout errors**: Increase `TIMEOUT` in `config.js`

### Google Calendar Issues
- **"Not authorized"**: Make sure app is Public or you're added as test user
- **401 errors**: Clear localStorage and reconnect Google account
- **Token expired**: Tokens last 1 hour, reconnect if expired

### Chrome/ChromeDriver Issues
- Make sure Chrome is installed
- Run `npm install` to reinstall chromedriver
- Check that port 9222 (debugging) is free

## 🔐 Security & Privacy

- ✅ All credentials stored locally (browser localStorage)
- ✅ No data sent to third parties
- ✅ Google OAuth uses secure token flow
- ✅ Scraping uses official referee website
- ⚠️ For production: Use HTTPS and secure the server

## 🚀 Production Deployment

See `PRODUCTION-DEPLOYMENT.md` for detailed instructions.

**Quick deploy with PM2:**
```bash
npm install -g pm2
pm2 start server.js --name basketball-scheduler
pm2 startup
pm2 save
```

## 📊 Cost Analysis

**100% FREE when run locally:**
- ✅ Node.js + Express: Free
- ✅ Selenium + Chrome: Free
- ✅ Google Calendar API: Free (up to 1,000,000 requests/day)
- ✅ No hosting costs (runs on your machine)

## 📜 License

This project is for personal use by basketball referees.

## 🎉 Status

**✅ FULLY FUNCTIONAL**
- Web scraping: ✅ Working
- Pagination: ✅ Working  
- Team/League extraction: ✅ Working
- Google Calendar sync: ✅ Working
- Token persistence: ✅ Working
- Change detection: ✅ Working

---

**Made with ❤️ for Basketball Referees**
