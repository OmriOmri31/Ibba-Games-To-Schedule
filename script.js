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
        
        // Update Google API status
        const statusText = document.getElementById('apiStatusText');
        const statusDiv = document.getElementById('googleApiStatus');
        
        if (this.gapi) {
            statusText.textContent = 'זמין ✅';
            statusDiv.style.background = '#d4edda';
        } else {
            statusText.textContent = 'לא זמין ❌ (תוכל עדיין לדלג)';
            statusDiv.style.background = '#f8d7da';
        }
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
            alert('Google API לא זמין. אנא רענן את הדף ונסה שוב.');
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
            if (changes.added.length > 0 || changes.removed.length > 0) {
                this.updateProgress(98, 'מעדכן יומן Google...');
                await this.updateGoogleCalendar(changes);
            }
            
            // Save new data
            this.saveStoredData(results);
            
            this.updateProgress(100, 'התהליך הושלם בהצלחה!');
            
            // Show results
            this.showResults(changes);
            
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
        
        const added = newGames.filter(newGame => 
            !oldGames.some(oldGame => oldGame.id === newGame.id)
        );
        
        const removed = oldGames.filter(oldGame => 
            !newGames.some(newGame => newGame.id === oldGame.id)
        );
        
        return { added, removed, updated: [] };
    }

    async updateGoogleCalendar(changes) {
        if (!this.accessToken || !this.googleAccount) {
            console.log('⚠️ Google Calendar not available, skipping calendar update');
            return; // Skip calendar update instead of throwing error
        }

        try {
            // Add new events
            for (const game of changes.added) {
                await this.createCalendarEvent(game);
            }
            
            // Remove old events
            for (const game of changes.removed) {
                await this.deleteCalendarEvent(game);
            }
        } catch (error) {
            console.error('❌ Google Calendar update failed:', error);
            // Don't throw error, just log it
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
            }
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

        return await response.json();
    }

    async deleteCalendarEvent(game) {
        // This would require storing the Google Calendar event ID
        // For now, we'll skip this implementation
        console.log('Would delete event for game:', game.id);
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

    showResults(changes) {
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsContent = document.getElementById('resultsContent');
        
        let html = '<h3>תוצאות עדכון:</h3>';
        
        if (changes.added.length > 0) {
            html += `<p><strong>נוספו ${changes.added.length} משחקים חדשים:</strong></p>`;
            changes.added.forEach(game => {
                const leagueName = game.leagueName || game.league;
                html += `<div class="game-item">
                    <h4>${game.homeTeamName || game.homeTeam} - ${game.guestTeamName || game.guestTeam} [${leagueName}]</h4>
                    <p>תאריך: ${game.date} ${game.time}</p>
                    <p>מיקום: ${game.address}</p>
                </div>`;
            });
        }
        
        if (changes.removed.length > 0) {
            html += `<p><strong>הוסרו ${changes.removed.length} משחקים:</strong></p>`;
            changes.removed.forEach(game => {
                const leagueName = game.leagueName || game.league;
                html += `<div class="game-item">
                    <h4>${game.homeTeamName || game.homeTeam} - ${game.guestTeamName || game.guestTeam} [${leagueName}]</h4>
                    <p>תאריך: ${game.date} ${game.time}</p>
                </div>`;
            });
        }
        
        if (changes.added.length === 0 && changes.removed.length === 0) {
            html += '<p>אין שינויים במשחקים</p>';
        }
        
        // Add note about Google Calendar
        if (!this.googleAccount) {
            html += '<div class="game-item" style="background: #fff3cd; border-left-color: #ffc107;">';
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
