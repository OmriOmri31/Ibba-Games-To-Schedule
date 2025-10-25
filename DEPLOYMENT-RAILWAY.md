# 🚂 Deploy to Railway.app

**Note:** Netlify cannot host this app because it requires:
- Node.js server (Express)
- Selenium WebDriver
- Chrome browser

Railway.app is the best free cloud option for this app.

---

## 📋 Prerequisites

1. GitHub account with your code pushed
2. Railway.app account (free): https://railway.app

---

## 🚀 Deployment Steps

### 1. Prepare the Project

Add this to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 2. Create Railway Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select: `Ibba-Games-To-Schedule`
5. Railway will auto-detect Node.js

### 3. Add Chrome Buildpack

In Railway project settings:

```bash
# Add environment variable
NIXPACKS_PKGS=google-chrome-stable

# Or use Dockerfile (more reliable)
```

Create `Dockerfile`:

```dockerfile
FROM node:18

# Install Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3006

CMD ["node", "server.js"]
```

### 4. Set Environment Variables

In Railway Dashboard → Variables:

```
GOOGLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
PORT=3006
HEADLESS_MODE=true
SELENIUM_TIMEOUT=30000
```

### 5. Deploy

Railway will automatically:
- Build the Docker image
- Install dependencies
- Start the server

---

## 🔗 Access Your App

Railway will give you a URL like:
```
https://ibba-games-to-schedule-production.up.railway.app
```

---

## ⚠️ Important Notes

1. **Google OAuth Redirect URI**
   - Add Railway URL to Google Cloud Console
   - Update `config.js` with production URL

2. **Free Tier Limits**
   - 500 hours/month free
   - $5/month after that
   - More than enough for personal use

3. **Keep PM2 for Local**
   - Railway for remote access
   - PM2 for your local machine

---

## 💡 Recommendation

**For your use case (single referee), keep it local with PM2:**
- ✅ Free forever
- ✅ Faster (no network latency)
- ✅ More reliable
- ✅ No hosting costs

**Only deploy to Railway if:**
- Multiple referees need access
- Need access from multiple devices/locations
- Want to share with colleagues

---

## 🆓 Cost Comparison

| Option | Cost | Setup | Best For |
|--------|------|-------|----------|
| **PM2 Local** | $0 | ✅ Done | Single user |
| **Railway** | ~$5/mo | Medium | Team use |
| **DigitalOcean** | $5/mo | Hard | Advanced |
| **Netlify** | ❌ Can't use | - | Static sites only |

---

**Recommendation:** Stick with PM2 local setup! It's perfect for your needs. 🎯

