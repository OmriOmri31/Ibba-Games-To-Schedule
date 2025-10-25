# Google Calendar Setup Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create/Access Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it: "Basketball Referee Scheduler"

### 1.2 Enable Google Calendar API
1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: "Basketball Referee Scheduler"
   - User support email: Your email
   - Developer contact: Your email
   - Add scope: `https://www.googleapis.com/auth/calendar`
   - Add test users: Your email
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "Basketball Referee Scheduler Web"
   - Authorized JavaScript origins:
     ```
     http://localhost:3006
     http://127.0.0.1:3006
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3006
     http://127.0.0.1:3006
     ```
5. Copy the **Client ID** and **API Key**

### 1.4 Update Configuration
Update `config.js` with your credentials:
```javascript
GOOGLE_API: {
    API_KEY: 'YOUR_API_KEY_HERE',
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com'
}
```

## Step 2: Test Google Calendar Integration

### 2.1 Start the Server
```bash
node server.js
```

### 2.2 Access the App
Open: `http://localhost:3006`

### 2.3 Login and Connect Google
1. Login with your referee credentials
2. Click "התחברות ל-Google"
3. Authorize the app to access your Google Calendar
4. Verify connection status shows your email

### 2.4 Test Scraping
1. Click "עדכן יומן משחקים"
2. Wait for scraping to complete
3. Check your Google Calendar for new events

## Step 3: Verify Calendar Events

Events should appear in your Google Calendar with:
- **Title**: `TeamA - TeamB [League]`
- **Date/Time**: Game date and time
- **Location**: Game address
- **Duration**: 2 hours (default)

## Troubleshooting

### Issue: "Google API לא זמין"
**Solution**: 
- Check internet connection
- Verify API Key and Client ID are correct
- Make sure Google Calendar API is enabled

### Issue: Authorization popup blocked
**Solution**:
- Allow popups for localhost:3006
- Try different browser

### Issue: "Access blocked: This app's request is invalid"
**Solution**:
- Verify redirect URIs match exactly
- Check OAuth consent screen is configured
- Add your email as test user

### Issue: Events not appearing in calendar
**Solution**:
- Check browser console for errors
- Verify you authorized calendar access (not just login)
- Check if the calendar API scope includes calendar.events

## Production Deployment

For production (non-localhost):
1. Update authorized origins and redirect URIs in Google Cloud Console
2. Add your production domain (e.g., `https://yourdomain.com`)
3. Update OAuth consent screen for production use
4. Move from "Testing" to "Published" status

