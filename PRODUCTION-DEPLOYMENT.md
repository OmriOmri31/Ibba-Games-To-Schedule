# Production Deployment Guide

## Option 1: Run as Windows Service (Recommended)

### Using PM2 (Process Manager)

1. **Install PM2 globally**:
```bash
npm install -g pm2
```

2. **Start the app**:
```bash
cd C:\Users\iamam\Ibba-Games-To-Schedule
pm2 start server.js --name "basketball-scheduler"
```

3. **Configure PM2 to start on boot**:
```bash
pm2 startup
pm2 save
```

4. **Useful PM2 commands**:
```bash
pm2 list                    # Show all running apps
pm2 logs basketball-scheduler  # View logs
pm2 restart basketball-scheduler  # Restart app
pm2 stop basketball-scheduler     # Stop app
pm2 delete basketball-scheduler   # Remove from PM2
```

## Option 2: Windows Task Scheduler

### Create a Batch File

1. Create `start-scheduler.bat`:
```batch
@echo off
cd C:\Users\iamam\Ibba-Games-To-Schedule
node server.js
```

2. **Set up Task Scheduler**:
   - Open Task Scheduler
   - Create Basic Task
   - Name: "Basketball Referee Scheduler"
   - Trigger: At startup
   - Action: Start a program
   - Program: `C:\Users\iamam\Ibba-Games-To-Schedule\start-scheduler.bat`
   - Run whether user is logged on or not

## Option 3: Simple Background Process

### Using PowerShell

Create `start-background.ps1`:
```powershell
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -WorkingDirectory "C:\Users\iamam\Ibba-Games-To-Schedule"
```

Run on startup:
- Press `Win + R`
- Type `shell:startup`
- Create shortcut to the PowerShell script

## Production Configuration

### 1. Update config.js for Production

```javascript
module.exports = {
    ENABLE_REAL_SCRAPING: true,
    TEST_CREDENTIALS: [], // Disable test mode
    
    GOOGLE_API: {
        API_KEY: process.env.GOOGLE_API_KEY || 'YOUR_API_KEY',
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'
    },
    
    SELENIUM: {
        HEADLESS: true,  // Always headless in production
        TIMEOUT: 30000,
        BASE_URL: 'https://judge.ibasketball.co.il'
    },
    
    SERVER: {
        PORT: process.env.PORT || 3006,
        HOST: '0.0.0.0'  // Listen on all interfaces
    }
};
```

### 2. Environment Variables

Create `.env` file (never commit this!):
```
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_client_id_here
PORT=3006
```

Install dotenv:
```bash
npm install dotenv
```

Update server.js top:
```javascript
require('dotenv').config();
```

### 3. Security Checklist

- [ ] Remove all test credentials from code
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS if exposing externally
- [ ] Set up firewall rules (only allow local access if needed)
- [ ] Regular backups of JSON data file
- [ ] Keep dependencies updated: `npm audit fix`

## Monitoring & Maintenance

### Logs
PM2 logs location:
```
C:\Users\iamam\.pm2\logs\
```

### Auto-restart on Failure
PM2 automatically restarts crashed apps. Configure max restarts:
```bash
pm2 start server.js --name basketball-scheduler --max-restarts 10
```

### Memory Management
Monitor memory usage:
```bash
pm2 monit
```

Set memory limit (auto-restart if exceeded):
```bash
pm2 start server.js --name basketball-scheduler --max-memory-restart 500M
```

## Accessing from Other Devices (Optional)

### 1. Find Your Computer's IP
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### 2. Access from Phone/Tablet
Open browser on other device:
```
http://192.168.1.100:3006
```

### 3. Firewall Rule
Add inbound rule in Windows Firewall:
- Port: 3006
- Protocol: TCP
- Action: Allow

## Backup Strategy

### Automatic Backup Script

Create `backup-data.js`:
```javascript
const fs = require('fs');
const path = require('path');

function backupData() {
    const dataFile = 'games-data.json';
    if (fs.existsSync(dataFile)) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupFile = `backups/games-data-${timestamp}.json`;
        
        if (!fs.existsSync('backups')) {
            fs.mkdirSync('backups');
        }
        
        fs.copyFileSync(dataFile, backupFile);
        console.log(`✅ Backup created: ${backupFile}`);
        
        // Keep only last 30 backups
        const backups = fs.readdirSync('backups')
            .filter(f => f.startsWith('games-data-'))
            .sort()
            .reverse();
        
        backups.slice(30).forEach(oldBackup => {
            fs.unlinkSync(path.join('backups', oldBackup));
        });
    }
}

backupData();
```

Schedule daily backup in Task Scheduler or use cron-like package.

## Update Procedure

1. Stop the service:
```bash
pm2 stop basketball-scheduler
```

2. Pull changes (if using git) or copy new files

3. Install new dependencies:
```bash
npm install
```

4. Restart:
```bash
pm2 restart basketball-scheduler
```

## Troubleshooting Production Issues

### Server Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :3006

# Kill process if needed
taskkill /F /PID <process_id>
```

### Chrome/ChromeDriver Issues
```bash
# Reinstall chromedriver
npm uninstall chromedriver
npm install chromedriver
```

### Memory Leaks
- Monitor with `pm2 monit`
- Set max-memory-restart
- Check for zombie Chrome processes:
```bash
tasklist | findstr chrome
```

## Performance Optimization

1. **Reduce logging in production**: Set log level to errors only
2. **Optimize scraping frequency**: Don't scrape too often
3. **Clean old data**: Remove games older than 1 year from JSON
4. **Chrome optimization**: Keep headless mode enabled

## Production Checklist

- [ ] PM2 installed and configured
- [ ] Environment variables set
- [ ] Auto-restart on boot configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Google Calendar OAuth configured for production
- [ ] Firewall rules configured (if needed)
- [ ] Documentation updated with actual credentials location
- [ ] Test end-to-end flow
- [ ] Emergency rollback plan ready

