# 🏗️ Build Desktop App (.exe) for Elderly Users

This guide shows how to package the Basketball Referee Scheduler into a single `.exe` file that non-technical users can simply double-click to run.

---

## ✅ What You Get

After building, you'll have:

1. **`Basketball-Referee-Scheduler-Portable.exe`**
   - Single file, no installation needed
   - ~150-200 MB
   - Just double-click to run
   - **Best for distributing via Google Drive**

2. **`Basketball-Referee-Scheduler-Setup.exe`**
   - Installer version
   - Creates desktop shortcut
   - Appears in Start Menu
   - **Best for users who want a "proper" installation**

---

## 🚀 How to Build

### Step 1: Test Electron Locally First

```bash
npm run electron
```

This will:
- Start the server automatically
- Open the app in an Electron window
- You can test everything before building

**Close the app** when done testing.

---

### Step 2: Build the Portable .exe

```bash
npm run build-portable
```

**This will take 5-10 minutes** the first time (downloads Chrome, etc.)

Output: `dist/Basketball Referee Scheduler-Portable.exe`

---

### Step 3: Build the Installer .exe (Optional)

```bash
npm run build-win
```

Output: `dist/Basketball Referee Scheduler Setup.exe`

---

## 📦 What Gets Packaged

The .exe includes:
- ✅ Node.js runtime (built-in)
- ✅ Chrome browser (headless)
- ✅ All your code (server + frontend)
- ✅ All dependencies (Selenium, Express, etc.)
- ✅ Configuration files

**Total size:** ~150-200 MB

---

## 🎁 Distributing to Users

### Option 1: Google Drive / WeTransfer
1. Upload the `.exe` to Google Drive
2. Share link with users
3. Users download and double-click to run

### Option 2: GitHub Releases
1. Create a release on GitHub
2. Attach the `.exe` file
3. Users download from GitHub

### Option 3: USB Drive
1. Copy `.exe` to USB
2. Give USB to users
3. They copy to their computer and run

---

## 👴 User Experience

### For Elderly Users:

1. **First Time:**
   - Download `Basketball-Referee-Scheduler-Portable.exe`
   - Double-click the file
   - Windows might show security warning → Click "Run Anyway"
   - App window opens
   - Enter referee number and password
   - Connect Google account (one time)
   - Done! ✅

2. **Every Time After:**
   - Double-click the `.exe` file
   - App opens automatically
   - Click "עדכן יומן משחקים"
   - Wait 1-2 minutes
   - Calendar updated! 🎉

**No command line. No technical knowledge needed!**

---

## 🔧 Customization

### Change App Icon
Replace `icon-192.png` with your custom icon, then rebuild.

### Change App Name
Edit `package.json`:
```json
"productName": "Your Custom Name Here"
```

### Add Auto-Update
Add this to `electron-main.js`:
```javascript
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
```

Then rebuild.

---

## ⚠️ Important Notes

### First Build Takes Long
- Downloads Electron binaries (~100 MB)
- Downloads Chrome (~150 MB)
- Compiles everything
- **5-10 minutes total**

Subsequent builds are much faster (~2 minutes).

### Windows Might Block It
When users first run the `.exe`, Windows Defender might show:
```
"Windows protected your PC"
```

**Solution:** Click "More info" → "Run anyway"

This happens with all unsigned apps. To avoid it, you need to:
- Buy a code signing certificate (~$100/year)
- OR: Publish on Microsoft Store (requires developer account)

For personal/small-scale use, "Run anyway" is fine.

---

## 🧪 Testing

### Test the .exe Before Distributing

1. Build the portable version:
   ```bash
   npm run build-portable
   ```

2. Find it in: `dist/Basketball Referee Scheduler-Portable.exe`

3. **Important:** Test on a DIFFERENT computer if possible
   - Or at least close all Node/PM2 instances
   - Make sure no server is running on port 3006

4. Double-click the `.exe`
   - Should start automatically
   - No console windows should appear
   - App window should open

5. Test full flow:
   - Login
   - Connect Google
   - Run scraper
   - Check calendar

---

## 📊 File Size Breakdown

```
Electron runtime:      ~100 MB
Chrome (headless):     ~80 MB
Your app + deps:       ~20 MB
Node.js built-in:      ~30 MB
-----------------------------------
Total:                 ~230 MB
```

Compressed .exe:       ~150 MB

---

## 🎯 Next Steps After Building

1. **Test the .exe yourself**
2. **Give it to one test user** (elderly person)
3. **Watch them use it** (get feedback)
4. **Make adjustments** if needed
5. **Distribute to all users**

---

## 💡 Pro Tips

### Make it Even Easier for Users

**Create a simple instruction PDF:**

```
📋 Basketball Referee Scheduler - התחלה מהירה

1️⃣  הורד את הקובץ
    Basketball-Referee-Scheduler-Portable.exe

2️⃣  לחץ פעמיים על הקובץ
    (אם Windows מזהיר, לחץ "הפעל בכל זאת")

3️⃣  הזן מספר שופט וסיסמה
    (רק בפעם הראשונה)

4️⃣  התחבר לחשבון Google
    (רק בפעם הראשונה)

5️⃣  לחץ על "עדכן יומן משחקים"

6️⃣  המתן דקה-שתיים ✅

זהו! היומן מעודכן 🎉
```

---

**Ready to build?** Run `npm run build-portable` and you're done! 🚀

