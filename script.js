// Basketball Referee Scheduler - Main Script
class RefereeScheduler {
    constructor() {
        this.isAuthenticated = false;
        this.googleAccount = null;
        this.gapi = null;
        this.tokenClient = null;
        this.accessToken = null;
        this.storedData = null;
        this.init();
    }

    async init() {
        // Restore Google account info from localStorage FIRST
        const savedAccount = localStorage.getItem('googleAccount');
        const savedToken = localStorage.getItem('googleAccessToken');
        const tokenExpiry = localStorage.getItem('googleTokenExpiry');
        
        if (savedAccount && savedToken && tokenExpiry) {
            const now = Date.now();
            if (now < parseInt(tokenExpiry)) {
                this.googleAccount = savedAccount;
                this.accessToken = savedToken;
                console.log('✅ Restored Google Calendar session:', savedAccount);
            } else {
                console.log('⚠️ Google token expired, clearing...');
                localStorage.removeItem('googleAccount');
                localStorage.removeItem('googleAccessToken');
                localStorage.removeItem('googleTokenExpiry');
            }
        }
        
        // Check if user is already logged in and show dashboard
        const storedCredentials = this.getStoredCredentials();
        if (storedCredentials) {
            this.showDashboard(storedCredentials);
        } else {
            this.showLoginForm();
        }

        // Initialize Google API with timeout
        const googleInitPromise = this.initializeGoogleAPI();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            await Promise.race([googleInitPromise, timeoutPromise]);
        } catch (error) {
            console.log('⚠️ Google API initialization skipped due to timeout/error');
        }
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Google authentication
        document.getElementById('googleAuthBtn').addEventListener('click', () => {
            this.authenticateGoogle();
        });

        // Skip Google setup
        document.getElementById('skipGoogleBtn').addEventListener('click', () => {
            console.log('⏭️ User chose to skip Google Calendar');
            this.showDashboard();
        });

        // Continue after Google auth
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.showDashboard();
        });

        // Switch Google account
        document.getElementById('switchAccountBtn').addEventListener('click', () => {
            this.switchGoogleAccount();
        });

        // Scrape button
        document.getElementById('scrapeBtn').addEventListener('click', () => {
            this.startScraping();
        });

        // View data button
        document.getElementById('viewDataBtn').addEventListener('click', () => {
            this.viewStoredData();
        });

        // Back to dashboard
        document.getElementById('backToDashboard').addEventListener('click', () => {
            this.showDashboard();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    async initializeGoogleAPI() {
        return new Promise((resolve) => {
            console.log('🔧 Initializing Google API...');
            
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.log('⏰ Google API initialization timeout, continuing without Google Calendar');
                this.gapi = null;
                this.tokenClient = null;
                resolve();
            }, 15000);
            
            if (typeof gapi !== 'undefined') {
                console.log('✅ Google API library loaded');
                gapi.load('client', async () => {
                    try {
                        console.log('📚 Loading Google API client...');
                        await gapi.client.init({
                            apiKey: 'AIzaSyC-vbKctbvYC0dRp7OEEKF7AfA5GH9_hYc',
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
                        });
                        
                        // Initialize the new Google Identity Services OAuth 2.0
                        if (typeof google !== 'undefined' && google.accounts) {
                            this.tokenClient = google.accounts.oauth2.initTokenClient({
                                client_id: '226898444057-cvngmad5l62jgr2vd270461k7qjca9ir.apps.googleusercontent.com',
                                scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
                                callback: (response) => {
                                    if (response.error) {
                                        console.error('❌ OAuth error:', response);
                                        return;
                                    }
                                    console.log('✅ OAuth token received');
                                    this.accessToken = response.access_token;
                                }
                            });
                            console.log('✅ Google Identity Services initialized');
                        }
                        
                        clearTimeout(timeout);
                        console.log('✅ Google API initialized successfully');
                        this.gapi = gapi;
                        resolve();
                    } catch (error) {
                        clearTimeout(timeout);
                        console.error('❌ Google API initialization failed:', error);
                        this.gapi = null;
                        this.tokenClient = null;
                        resolve();
                    }
                });
            } else {
                clearTimeout(timeout);
                console.log('⚠️ Google API library not loaded, continuing without Google Calendar');
                resolve();
            }
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('googleSetup').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('dataViewer').style.display = 'none';
    }

    showGoogleSetup() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('googleSetup').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('dataViewer').style.display = 'none';
    }

    showDashboard(credentials = null) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('googleSetup').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('dataViewer').style.display = 'none';

        // Update referee number
        if (credentials) {
            document.getElementById('currentRefNumber').textContent = credentials.refNumber;
        } else {
            const storedCreds = this.getStoredCredentials();
            if (storedCreds) {
                document.getElementById('currentRefNumber').textContent = storedCreds.refNumber;
            }
        }
        
        // Always update Google account display
        document.getElementById('currentGoogleAccount').textContent = this.googleAccount || 'לא מחובר';
    }

    showDataViewer() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('googleSetup').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('dataViewer').style.display = 'block';
    }

    async handleLogin() {
        const refNumber = document.getElementById('refNumber').value;
        const password = document.getElementById('password').value;

        console.log('🔐 Handling login for referee:', refNumber);

        if (!refNumber || !password) {
            alert('אנא מלא את כל השדות');
            return;
        }

        // Store credentials
        this.storeCredentials({ refNumber, password });
        console.log('💾 Credentials stored');
        
        // Show Google setup if not authenticated
        if (!this.googleAccount) {
            console.log('🔗 Showing Google setup');
            this.showGoogleSetup();
            
            // Add a "Skip" button option instead of automatic skip
            // User can manually choose to skip Google Calendar setup
        } else {
            console.log('✅ Showing dashboard');
            this.showDashboard({ refNumber, password });
        }
    }

    async authenticateGoogle() {
        if (!this.tokenClient) {
            console.error('❌ Google API not available');
            alert('לא ניתן להתחבר ל-Google כרגע. אנא רענן את הדף ונסה שנית.');
            return;
        }

        try {
            console.log('🔐 Requesting OAuth token...');
            
            // Request an access token
            this.tokenClient.callback = async (response) => {
                if (response.error) {
                    console.error('❌ OAuth error:', response);
                    alert('שגיאה בהתחברות ל-Google: ' + response.error);
                    return;
                }
                
                console.log('✅ OAuth token received');
                this.accessToken = response.access_token;
                
                // Get user info
                try {
                    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${this.accessToken}` }
                    });
                    const userInfo = await userInfoResponse.json();
                    
                    this.googleAccount = userInfo.email;
                    document.getElementById('googleEmail').textContent = this.googleAccount;
                    document.getElementById('googleAccountInfo').style.display = 'block';
                    
                    // Save to localStorage
                    localStorage.setItem('googleAccount', this.googleAccount);
                    localStorage.setItem('googleAccessToken', this.accessToken);
                    localStorage.setItem('googleTokenExpiry', Date.now() + (3600 * 1000)); // 1 hour
                    
                    // Hide the auth buttons
                    document.getElementById('googleAuthBtn').style.display = 'none';
                    document.getElementById('skipGoogleBtn').style.display = 'none';
                    
                    console.log('✅ Google Calendar connected successfully');
                    alert('הצלחה! מחובר ל-Google Calendar');
                } catch (error) {
                    console.error('❌ Failed to get user info:', error);
                    alert('שגיאה בקבלת מידע משתמש: ' + error.message);
                }
            };
            
            // Request token
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
            
        } catch (error) {
            console.error('Google authentication failed:', error);
            alert('שגיאה בהתחברות ל-Google: ' + error.message);
        }
    }

    switchGoogleAccount() {
        // Revoke the current token and reset
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('✅ Token revoked');
            });
        }
        
        this.accessToken = null;
        this.googleAccount = null;
        document.getElementById('googleAccountInfo').style.display = 'none';
        document.getElementById('googleAuthBtn').style.display = 'block';
        document.getElementById('skipGoogleBtn').style.display = 'block';
        
        // Re-authenticate
        this.authenticateGoogle();
    }

    async startScraping() {
        this.showLoading(true);
        this.updateProgress(0, 'מתחיל תהליך...');
        
        // Show progress container
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('resultsContainer').style.display = 'none';

        try {
            // Load existing data
            this.storedData = this.loadStoredData();
            
            // Start the scraping process
            const results = await this.scrapeWebsite();
            
            this.updateProgress(95, 'מעבד שינויים...');
            
            // Process and compare data
            const changes = this.compareData(this.storedData, results);
            
            // Update Google Calendar
            if (changes.added.length > 0 || changes.removed.length > 0 || (changes.updated && changes.updated.length > 0)) {
                this.updateProgress(98, 'מעדכן יומן Google...');
                await this.updateGoogleCalendar(changes);
            }
            
            // Save new data
            this.saveStoredData(results);
            
            this.updateProgress(100, 'התהליך הושלם בהצלחה!');
            
            // Show results with ALL games
            this.showResults(changes, results);
            
            // Show success message
            setTimeout(() => {
                alert('הלוח עודכן בהצלחה!');
            }, 1000);
            
        } catch (error) {
            console.error('Scraping failed:', error);
            this.updateProgress(0, 'שגיאה בתהליך');
            alert('שגיאה בתהליך: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async scrapeWebsite() {
        this.updateProgress(10, 'שולח בקשה לשרת...');
        
        const credentials = this.getStoredCredentials();
        if (!credentials) {
            throw new Error('לא נמצאו פרטי התחברות');
        }

        this.updateProgress(20, 'ממתין לתגובה...');
        
        try {
            // Show message that this might take a while
            setTimeout(() => {
                const currentProgress = parseInt(document.getElementById('progressBar').style.width);
                if (currentProgress < 90) {
                    this.updateProgress(40, 'מאתחל Chrome ודפדפן... (עשוי לקחת דקה)');
                }
            }, 2000);
            
            setTimeout(() => {
                const currentProgress = parseInt(document.getElementById('progressBar').style.width);
                if (currentProgress < 90) {
                    this.updateProgress(60, 'מתחבר לאתר השופטים... אנא המתן');
                }
            }, 5000);
            
                const response = await fetch('/api/scrape', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refNumber: credentials.refNumber,
                        password: credentials.password
                    })
                });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'שגיאה בשרת');
            }
            
            this.updateProgress(90, 'מעבד נתונים...');
            const result = await response.json();
            this.updateProgress(100, 'הושלם!');
            
            return result.games;
        } catch (error) {
            console.error('Scraping failed:', error);
            this.updateProgress(0, 'שגיאה בתהליך');
            throw new Error('שגיאה בחילוץ נתונים: ' + error.message);
        }
    }

    getMockGameData() {
        return [
            {
                league: "1 - ליגת על",
                date: "25/10/2025",
                time: "19:00",
                homeTeam: "בני הרצליה פנלינק",
                guestTeam: "מכבי ת\"א פלייטיקה",
                address: "אולם היובל, רח' רש\"י 24, הרצליה",
                id: "game_1"
            },
            {
                league: "101 נוער על צפון",
                date: "27/10/2025",
                time: "19:00",
                homeTeam: "אליצור עירוני נתניה",
                guestTeam: "הפועל כפר סבא אביב",
                address: "ביה\"ס ישורון, רח' שמואל הנציב פינת ברנר, נתניה",
                id: "game_2"
            },
            {
                league: "52 לאומית נשים",
                date: "28/10/2025",
                time: "19:00",
                homeTeam: "מכבי רעננה",
                guestTeam: "הפועל כפר סבא",
                address: "היכל אביב, רח' הפרחים 1, רעננה",
                id: "game_3"
            }
        ];
    }

    compareData(oldData, newData) {
        const oldGames = oldData || [];
        const newGames = newData || [];
        
        // Find truly new games (not in old data at all)
        const added = newGames.filter(newGame => 
            !oldGames.some(oldGame => oldGame.id === newGame.id)
        );
        
        // Find removed games (in old data but not in new)
        const removed = oldGames.filter(oldGame => 
            !newGames.some(newGame => newGame.id === oldGame.id)
        );
        
        // Find updated games (same ID but different details)
        const updated = newGames.filter(newGame => {
            const oldGame = oldGames.find(old => old.id === newGame.id);
            if (!oldGame) return false;
            
            // Check if any important details changed
            return oldGame.date !== newGame.date ||
                   oldGame.time !== newGame.time ||
                   oldGame.address !== newGame.address ||
                   oldGame.league !== newGame.league;
        }).map(newGame => {
            // Include the old calendar event ID if it exists
            const oldGame = oldGames.find(old => old.id === newGame.id);
            return {
                ...newGame,
                calendarEventId: oldGame?.calendarEventId
            };
        });
        
        // Find unchanged games (for checking calendar sync)
        const unchanged = newGames.filter(newGame => {
            const oldGame = oldGames.find(old => old.id === newGame.id);
            if (!oldGame) return false;
            
            // Same game with no changes
            return oldGame.date === newGame.date &&
                   oldGame.time === newGame.time &&
                   oldGame.address === newGame.address &&
                   oldGame.league === newGame.league;
        }).map(newGame => {
            // Include the old calendar event ID
            const oldGame = oldGames.find(old => old.id === newGame.id);
            return {
                ...newGame,
                calendarEventId: oldGame?.calendarEventId
            };
        });
        
        return { added, removed, updated, unchanged };
    }

    async updateGoogleCalendar(changes) {
        if (!this.accessToken || !this.googleAccount) {
            console.log('⚠️ Google Calendar not available, skipping calendar update');
            return; // Skip calendar update instead of throwing error
        }

        try {
            // Step 1: Get all existing calendar events to find and remove duplicates
            console.log('🔍 Checking for duplicate events in calendar...');
            const allCalendarEvents = await this.getAllCalendarEvents();
            const duplicatesDeleted = await this.deleteDuplicateEvents(allCalendarEvents, changes);
            
            // Step 2: Check for missing events (existed in JSON but deleted from calendar)
            const missing = [];
            if (changes.unchanged && changes.unchanged.length > 0) {
                for (const game of changes.unchanged) {
                    if (game.calendarEventId) {
                        const exists = await this.checkEventExists(game.calendarEventId);
                        if (!exists) {
                            missing.push(game);
                        }
                    } else {
                        // No event ID means it was never added to calendar
                        missing.push(game);
                    }
                }
            }
            
            // Step 3: Add new events
            for (const game of changes.added) {
                await this.createCalendarEvent(game);
            }
            
            // Step 4: Re-add missing events
            for (const game of missing) {
                console.log('🔄 Re-adding deleted event for game:', game.id);
                await this.createCalendarEvent(game);
            }
            
            // Step 5: Update changed events (delete old, create new)
            for (const game of changes.updated) {
                console.log('🔄 Updating event for game:', game.id);
                await this.deleteCalendarEvent(game);
                await this.createCalendarEvent(game);
            }
            
            // Step 6: Remove old events (games no longer in JSON)
            for (const game of changes.removed) {
                await this.deleteCalendarEvent(game);
            }
            
            // Store counts for user notification
            this.missingEventsCount = missing.length;
            this.duplicatesDeletedCount = duplicatesDeleted;
        } catch (error) {
            console.error('❌ Google Calendar update failed:', error);
            // Don't throw error, just log it
        }
    }

    async getAllCalendarEvents() {
        // Get events from now to 1 year from now
        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
                `timeMin=${now.toISOString()}&` +
                `timeMax=${oneYearLater.toISOString()}&` +
                `singleEvents=true&` +
                `orderBy=startTime&` +
                `maxResults=2500`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.items || [];
            }
            return [];
        } catch (error) {
            console.error('❌ Error fetching calendar events:', error);
            return [];
        }
    }

    async deleteDuplicateEvents(calendarEvents, changes) {
        let duplicatesDeleted = 0;
        const allGames = [...changes.added, ...changes.unchanged, ...changes.updated];
        
        // Group calendar events by date and summary to find duplicates
        const eventsByKey = {};
        
        for (const event of calendarEvents) {
            if (!event.start || !event.start.dateTime) continue;
            
            const date = event.start.dateTime.split('T')[0];
            const summary = event.summary || '';
            const key = `${date}|||${summary}`;
            
            if (!eventsByKey[key]) {
                eventsByKey[key] = [];
            }
            eventsByKey[key].push(event);
        }
        
        // For each key, if there are duplicates, keep only the most recent one
        for (const key in eventsByKey) {
            const events = eventsByKey[key];
            if (events.length > 1) {
                // Sort by creation time, keep the most recent
                events.sort((a, b) => new Date(b.created) - new Date(a.created));
                
                // Delete all except the first (most recent)
                for (let i = 1; i < events.length; i++) {
                    console.log(`🗑️  Deleting duplicate event: ${events[i].summary} on ${events[i].start.dateTime}`);
                    await this.deleteCalendarEventById(events[i].id);
                    duplicatesDeleted++;
                }
            }
        }
        
        return duplicatesDeleted;
    }

    async deleteCalendarEventById(eventId) {
        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return response.ok || response.status === 410;
        } catch (error) {
            console.error('❌ Error deleting event:', error);
            return false;
        }
    }

    async createCalendarEvent(game) {
        const leagueName = game.leagueName || game.league;
        const event = {
            summary: `${game.homeTeamName || game.homeTeam} - ${game.guestTeamName || game.guestTeam} [${leagueName}]`,
            location: game.address,
            start: {
                dateTime: this.parseDateTime(game.date, game.time),
                timeZone: 'Asia/Jerusalem'
            },
            end: {
                dateTime: this.parseDateTime(game.date, this.addHours(game.time, 2)),
                timeZone: 'Asia/Jerusalem'
            },
            colorId: '5'  // Yellow color in Google Calendar
        };

        // Use the new REST API with access token
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
        }

        const createdEvent = await response.json();
        
        // Store the event ID in the game object for future reference
        game.calendarEventId = createdEvent.id;
        
        return createdEvent;
    }

    async checkEventExists(eventId) {
        if (!eventId) return false;

        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return response.ok; // 200 = exists, 404 = not found
        } catch (error) {
            console.error('❌ Error checking calendar event:', error);
            return false;
        }
    }

    async deleteCalendarEvent(game) {
        if (!game.calendarEventId) {
            console.log('⚠️  No calendar event ID for game:', game.id);
            return;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${game.calendarEventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.ok || response.status === 410) {  // 410 = already deleted
                console.log('✅ Deleted calendar event for game:', game.id);
            } else {
                console.error('❌ Failed to delete event:', response.status);
            }
        } catch (error) {
            console.error('❌ Error deleting calendar event:', error);
        }
    }

    extractTeamName(teamField) {
        const parts = teamField.split(' ');
        if (parts.length >= 3) {
            return parts.slice(1, 3).join(' ');
        }
        return teamField;
    }

    parseDateTime(dateStr, timeStr) {
        const [day, month, year] = dateStr.split('/');
        const [hours, minutes] = timeStr.split(':');
        return new Date(year, month - 1, day, hours, minutes).toISOString();
    }

    addHours(timeStr, hours) {
        const [h, m] = timeStr.split(':').map(Number);
        const newHour = (h + hours) % 24;
        return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    showResults(changes, allGames = null) {
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsContent = document.getElementById('resultsContent');
        
        let html = '<h3>תוצאות עדכון:</h3>';
        
        // Show changes summary
        const totalChanges = changes.added.length + (changes.updated?.length || 0) + changes.removed.length;
        if (totalChanges > 0) {
            html += '<div class="game-item" style="background: #e3f2fd; border-right-color: #2196f3;">';
            html += '<h4>📊 סיכום שינויים:</h4>';
            if (changes.added.length > 0) html += `<p>✅ נוספו: ${changes.added.length} משחקים</p>`;
            if (changes.updated && changes.updated.length > 0) html += `<p>🔄 עודכנו: ${changes.updated.length} משחקים</p>`;
            if (changes.removed.length > 0) html += `<p>❌ הוסרו: ${changes.removed.length} משחקים</p>`;
            if (this.duplicatesDeletedCount && this.duplicatesDeletedCount > 0) {
                html += `<p>🗑️ נמחקו כפילויות: ${this.duplicatesDeletedCount} אירועים</p>`;
                this.duplicatesDeletedCount = 0;
            }
            if (this.missingEventsCount && this.missingEventsCount > 0) {
                html += `<p>🔄 שוחזרו: ${this.missingEventsCount} אירועים</p>`;
                this.missingEventsCount = 0;
            }
            html += '</div>';
        } else {
            html += '<p>✅ אין שינויים - הכל מעודכן!</p>';
            if (this.duplicatesDeletedCount && this.duplicatesDeletedCount > 0) {
                html += `<div class="game-item" style="background: #d4edda; border-right-color: #28a745;">
                    <h4>🗑️ נמחקו ${this.duplicatesDeletedCount} כפילויות</h4>
                    <p>אירועים כפולים הוסרו מהיומן!</p>
                </div>`;
                this.duplicatesDeletedCount = 0;
            }
        }
        
        // Show ALL games
        if (allGames && allGames.length > 0) {
            html += `<hr style="margin: 20px 0;"><h3>📋 כל המשחקים (${allGames.length}):</h3>`;
            allGames.forEach(game => {
                const leagueName = game.leagueName || game.league;
                // Mark game with color based on status
                let borderColor = '#667eea'; // default
                let statusIcon = '';
                if (changes.added.some(g => g.id === game.id)) {
                    borderColor = '#28a745';
                    statusIcon = '✨ חדש ';
                } else if (changes.updated && changes.updated.some(g => g.id === game.id)) {
                    borderColor = '#ffc107';
                    statusIcon = '🔄 עודכן ';
                }
                
                html += `<div class="game-item" style="border-right: 4px solid ${borderColor};">
                    <h4>${statusIcon}${game.homeTeamName || game.homeTeam} - ${game.guestTeamName || game.guestTeam} [${leagueName}]</h4>
                    <p>📅 ${game.date} ⏰ ${game.time}</p>
                    <p>📍 ${game.address}</p>
                </div>`;
            });
        }
        
        // Add note about Google Calendar
        if (!this.googleAccount) {
            html += '<div class="game-item" style="background: #fff3cd; border-right-color: #ffc107;">';
            html += '<h4>⚠️ Google Calendar לא מחובר</h4>';
            html += '<p>הנתונים נשמרו מקומית. לחיבור ל-Google Calendar, לחץ על "התחברות ל-Google"</p>';
            html += '</div>';
        }
        
        resultsContent.innerHTML = html;
        resultsContainer.style.display = 'block';
        
        // Show success message
        setTimeout(() => {
            if (this.googleAccount) {
                alert('הלוח עודכן בהצלחה!');
            } else {
                alert('הנתונים נשמרו מקומית! Google Calendar לא מחובר.');
            }
        }, 1000);
    }

    viewStoredData() {
        this.showDataViewer();
        const gamesData = document.getElementById('gamesData');
        const data = this.loadStoredData();
        
        if (!data || data.length === 0) {
            gamesData.innerHTML = `
                <div class="game-item">
                    <h4>אין נתונים שמורים</h4>
                    <p>לחץ על "עדכן יומן משחקים" כדי לחלץ נתונים מהאתר</p>
                    <p><strong>הערה:</strong> Google Calendar לא מחובר, אבל הנתונים יישמרו מקומית</p>
                </div>
            `;
            return;
        }
        
        let html = `<h3>נמצאו ${data.length} משחקים:</h3>`;
        data.forEach(game => {
            const leagueName = game.leagueName || game.league;
            html += `<div class="game-item">
                <h4>${game.homeTeamName || game.homeTeam} - ${game.guestTeamName || game.guestTeam} [${leagueName}]</h4>
                <p><strong>תאריך:</strong> ${game.date} ${game.time}</p>
                <p><strong>מיקום:</strong> ${game.address}</p>
            </div>`;
        });
        
        gamesData.innerHTML = html;
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    updateProgress(percent, text) {
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }

    storeCredentials(credentials) {
        localStorage.setItem('refereeCredentials', JSON.stringify(credentials));
    }

    getStoredCredentials() {
        const stored = localStorage.getItem('refereeCredentials');
        return stored ? JSON.parse(stored) : null;
    }

    loadStoredData() {
        const stored = localStorage.getItem('refereeGamesData');
        return stored ? JSON.parse(stored) : null;
    }

    saveStoredData(data) {
        localStorage.setItem('refereeGamesData', JSON.stringify(data));
    }

    logout() {
        localStorage.removeItem('refereeCredentials');
        localStorage.removeItem('refereeGamesData');
        localStorage.removeItem('googleAccount');
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('googleTokenExpiry');
        this.googleAccount = null;
        this.accessToken = null;
        this.showLoginForm();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new RefereeScheduler();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
