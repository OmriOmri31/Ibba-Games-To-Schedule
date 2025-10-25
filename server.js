// Basketball Referee Scheduler - Production Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3006;
const DATA_FILE = 'games-data.json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

console.log('🚀 Basketball Referee Scheduler server starting...');

// Helper functions
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function extractTeamName(fullTeamText) {
    // Extract team name: get 2nd and 3rd words from the actual team name
    // Example: "1535 - בני הרצליה פנלינק" -> "הרצליה פנלינק" (2nd & 3rd words after removing ID)
    // Example: "17 - הפועל כפר סבא אביב" -> "כפר סבא" (2nd & 3rd words after removing ID)
    
    const text = fullTeamText.trim();
    
    // Split by whitespace
    const allWords = text.split(/\s+/);
    
    // Filter out: dashes and pure numbers (numbers without any letters)
    const nameWords = allWords.filter(word => {
        // Skip dashes
        if (word === '-') return false;
        
        // Skip if it's ONLY digits (pure number like "1535")
        if (/^\d+$/.test(word)) return false;
        
        // Keep everything else (including Hebrew words)
        return true;
    });
    
    // Take the 2nd and 3rd words (indices 1 and 2)
    if (nameWords.length >= 3) {
        return `${nameWords[1]} ${nameWords[2]}`;
    } else if (nameWords.length === 2) {
        // If only 2 words, return both
        return `${nameWords[0]} ${nameWords[1]}`;
    } else if (nameWords.length === 1) {
        return nameWords[0];
    } else {
        return fullTeamText.trim();
    }
}

function extractLeagueName(fullLeagueText) {
    // Extract league name: skip number and dash, take first 1-2 words
    // Example: "101 - נוער על צפון" -> "נוער על"
    // Example: "1 - ליגת על" -> "ליגת על"
    
    const text = fullLeagueText.trim();
    
    // Split by whitespace
    const allWords = text.split(/\s+/);
    
    // Filter out: dashes and pure numbers
    const nameWords = allWords.filter(word => {
        if (word === '-') return false;
        if (/^\d+$/.test(word)) return false;
        return true;
    });
    
    // Take first 1-2 words
    if (nameWords.length >= 2) {
        return `${nameWords[0]} ${nameWords[1]}`;
    } else if (nameWords.length === 1) {
        return nameWords[0];
    } else {
        return fullLeagueText.trim();
    }
}

// Data management functions
function loadStoredGames() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ Error loading stored games:', error.message);
    }
    return [];
}

function saveGames(games) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2), 'utf8');
        console.log(`💾 Saved ${games.length} games to ${DATA_FILE}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving games:', error.message);
        return false;
    }
}

function compareGames(oldGames, newGames) {
    // Create a unique key for each game
    const getGameKey = (game) => `${game.date}_${game.time}_${game.homeTeam}_${game.guestTeam}`;
    
    const oldKeys = new Set(oldGames.map(getGameKey));
    const newKeys = new Set(newGames.map(getGameKey));
    
    const added = newGames.filter(game => !oldKeys.has(getGameKey(game)));
    const removed = oldGames.filter(game => !newKeys.has(getGameKey(game)));
    const unchanged = newGames.filter(game => oldKeys.has(getGameKey(game)));
    
    return {
        added,
        removed,
        unchanged,
        totalOld: oldGames.length,
        totalNew: newGames.length
    };
}

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
    const { refNumber, password } = req.body;
    
    console.log(`\n🔍 Received scraping request for referee: ${refNumber}`);
    
    if (!refNumber || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    // Test mode - return mock data
    if (refNumber === '12345' || refNumber === 'test123') {
        console.log('🧪 Test mode - returning mock data');
        return res.json({
            success: true,
            games: [
                {
                    id: 'game_1',
                    league: '1 - ליגת על',
                    date: '25/10/2025',
                    time: '19:00',
                    homeTeam: 'בני הרצליה פנלינק',
                    guestTeam: 'מכבי ת"א פלייטיקה',
                    homeTeamName: 'בני הרצליה',
                    guestTeamName: 'מכבי ת"א',
                    address: 'אולם היובל, רח\' רש"י 24, הרצליה'
                },
                {
                    id: 'game_2',
                    league: '101 נוער על צפון',
                    date: '27/10/2025',
                    time: '19:00',
                    homeTeam: 'אליצור עירוני נתניה',
                    guestTeam: 'הפועל כפר סבא אביב',
                    homeTeamName: 'אליצור עירוני',
                    guestTeamName: 'הפועל כפר',
                    address: 'ביה"ס ישורון, רח\' שמואל הנציב פינת ברנר, נתניה'
                }
            ],
            count: 2,
            testMode: true
        });
    }

    // Real scraping
    console.log('🌐 Real scraping mode - using Selenium WebDriver');
    
    let driver = null;
    try {
        // Start Chrome
        console.log('⏱️  Starting Chrome...');
        const startTime = Date.now();
        
        const options = new chrome.Options();
        options.addArguments('--headless');  // Try headless first to see if it works
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-software-rasterizer');
        options.addArguments('--remote-debugging-port=9222');  // Use specific debugging port
        
        // Build Chrome with timeout - SIMPLE approach (no ServiceBuilder)
        const buildPromise = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Chrome startup timed out after 30 seconds')), 30000);
        });
        
        driver = await Promise.race([buildPromise, timeoutPromise]);
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Chrome started in ${elapsed}s`);
        
        // Login
        console.log('🔐 Logging in...');
        await driver.get('https://judge.ibasketball.co.il/#!/login');
        await driver.wait(until.elementLocated(By.css('input[ng-model="user.username"]')), 10000);
        
        const usernameField = await driver.findElement(By.css('input[ng-model="user.username"]'));
        await usernameField.sendKeys(refNumber);
        
        const passwordField = await driver.findElement(By.css('input[ng-model="user.password"]'));
        await passwordField.sendKeys(password);
        
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();
        await driver.sleep(2000);
        
        // Navigate to games page
        console.log('📍 Navigating to games page...');
        await driver.get('https://judge.ibasketball.co.il/#!/games');
        await driver.sleep(2000);
        
        // Verify we're on the games page - if not, try again
        let currentUrl = await driver.getCurrentUrl();
        
        if (!currentUrl.includes('#!/games')) {
            console.log('   ⚠️  Not on games page, navigating again...');
            await driver.get('https://judge.ibasketball.co.il/#!/games');
            await driver.sleep(3000);
        }
        
        console.log('✅ On games page');
        
        // Set date filters
        console.log('📅 Setting date filters...');
        await driver.wait(until.elementLocated(By.css('input[ng-model="filterData.fromDate"]')), 10000);
        
        const today = new Date();
        const todayStr = formatDate(today);
        
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        const toDateStr = formatDate(oneYearFromNow);
        
        const fromDateField = await driver.findElement(By.css('input[ng-model="filterData.fromDate"]'));
        await fromDateField.clear();
        await fromDateField.sendKeys(todayStr);
        
        const toDateField = await driver.findElement(By.css('input[ng-model="filterData.toDate"]'));
        await toDateField.clear();
        await toDateField.sendKeys(toDateStr);
        
        // Wait longer for the table to reload with new date range
        console.log('⏳ Waiting for table to reload with new dates...');
        await driver.sleep(5000);  // Increased from 2s to 5s
        console.log('✅ Date filters set and table reloaded');
        
        // Scrape games
        console.log('🏀 Scraping games...');
        const games = [];
        let pageNumber = 1;
        
        while (true) {
            console.log(`   📄 Scraping page ${pageNumber}...`);
            
            await driver.wait(until.elementLocated(By.css('table tbody tr')), 10000);
            await driver.sleep(1000);
            
            const rows = await driver.findElements(By.css('table tbody tr'));
            console.log(`   Found ${rows.length} rows`);
            
             for (const row of rows) {
                 try {
                     const cells = await row.findElements(By.css('td'));
                     
                     // Skip rows with insufficient data
                     if (cells.length < 6) continue;
                     
                     const cellTexts = [];
                     for (const cell of cells) {
                         cellTexts.push(await cell.getText());
                     }
                     
                     // Skip completely empty rows
                     if (cellTexts.every(text => !text.trim())) continue;
                     
                     // Extract data - adjust indices based on actual table structure
                     const league = cellTexts[0] || '';
                     const round = cellTexts[1] || '';  // מחזור
                     const date = cellTexts[2] || '';
                     const day = cellTexts[3] || '';    // יום
                     const time = cellTexts[4] || '';
                     const homeTeam = cellTexts[5] || '';
                     const guestTeam = cellTexts[6] || '';
                     const address = cellTexts[7] || '';
                     
                    // Skip if essential data is missing
                    if (!league || !date || !time || (!homeTeam && !guestTeam)) continue;
                    
                    games.push({
                        id: `game_${games.length + 1}`,
                        league: league.trim(),
                        leagueName: extractLeagueName(league),
                        date: date.trim(),
                        time: time.trim(),
                        homeTeam: homeTeam.trim(),
                        guestTeam: guestTeam.trim(),
                        homeTeamName: extractTeamName(homeTeam),
                        guestTeamName: extractTeamName(guestTeam),
                        address: address.trim()
                    });
                 } catch (err) {
                     // Skip invalid rows
                     console.log('   Skipping row:', err.message);
                 }
             }
            
            // Check for next page link (it's an <a> tag, not <button>)
            try {
                // Get the FIRST row's text as a "fingerprint" of current page
                const currentPageFirstRow = rows.length > 0 ? await rows[0].getText() : '';
                
                // Look for the "הבא" (Next) link
                const nextLinks = await driver.findElements(By.xpath("//a[contains(text(), 'הבא')]"));
                
                console.log(`   🔍 Found ${nextLinks.length} "הבא" links`);
                
                // Find a VISIBLE link and try to click it
                let clickedSuccessfully = false;
                for (const link of nextLinks) {
                    try {
                        const isDisplayed = await link.isDisplayed();
                        if (!isDisplayed) {
                            console.log(`   ⏭️  Link not displayed, skipping...`);
                            continue;
                        }
                        
                        console.log(`   ➡️  Attempting to click "הבא" for page ${pageNumber + 1}...`);
                        await link.click();
                        await driver.sleep(3000);  // Wait for page to load
                        
                        clickedSuccessfully = true;
                        break;
                    } catch (clickError) {
                        console.log(`   ⚠️  Click failed: ${clickError.message}`);
                        // Try next link
                    }
                }
                
                if (!clickedSuccessfully) {
                    console.log(`   ⏹️  Could not click any "הבא" link - last page`);
                    break;
                }
                
                // Now check if content actually changed
                const newRows = await driver.findElements(By.css('tbody tr'));
                if (newRows.length === 0) {
                    console.log(`   ⏹️  No rows after click - last page`);
                    break;
                }
                
                const newPageFirstRow = await newRows[0].getText();
                
                if (newPageFirstRow === currentPageFirstRow) {
                    console.log(`   ⏹️  Page content didn't change - we're on the last page!`);
                    break;
                } else {
                    console.log(`   ✅ Page content changed - continuing to page ${pageNumber + 1}`);
                    pageNumber++;
                }
                
            } catch (err) {
                console.log(`   ⏹️  Error checking next page: ${err.message}`);
                break;
            }
        }
        
        console.log(`✅ Scraped ${games.length} games from ${pageNumber} page(s)`);
        
        await driver.quit();
        console.log('🔚 Chrome closed');
        
        // Compare with stored data
        const storedGames = loadStoredGames();
        const comparison = compareGames(storedGames, games);
        
        console.log(`📊 Comparison: ${comparison.added.length} added, ${comparison.removed.length} removed, ${comparison.unchanged.length} unchanged`);
        
        // Save new data
        saveGames(games);
        
        res.json({
            success: true,
            games: games,
            count: games.length,
            changes: {
                added: comparison.added,
                removed: comparison.removed,
                totalOld: comparison.totalOld,
                totalNew: comparison.totalNew
            }
        });
        
    } catch (error) {
        console.error('❌ Scraping error:', error.message);
        
        if (driver) {
            await driver.quit();
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get stored games
app.get('/api/games', (req, res) => {
    try {
        const games = loadStoredGames();
        res.json({
            success: true,
            games: games,
            count: games.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date().toISOString(),
        dataFile: DATA_FILE,
        dataFileExists: fs.existsSync(DATA_FILE)
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Basketball Referee Scheduler server running on port ${PORT}`);
    console.log(`📞 Access the app at: http://localhost:${PORT}`);
});

