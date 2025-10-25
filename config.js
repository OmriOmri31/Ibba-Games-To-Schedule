// Configuration file for Basketball Referee Scheduler
module.exports = {
    // Set to true to enable real scraping, false for test mode
    ENABLE_REAL_SCRAPING: true,
    
    // Test credentials that will use mock data
    TEST_CREDENTIALS: ['12345', 'test123'],
    
    // Google API Configuration
    GOOGLE_API: {
        API_KEY: 'AIzaSyC-vbKctbvYC0dRp7OEEKF7AfA5GH9_hYc',
        CLIENT_ID: '226898444057-cvngmad5l62jgr2vd270461k7qjca9ir.apps.googleusercontent.com'
    },
    
    // Selenium Configuration
    SELENIUM: {
        HEADLESS: true,
        TIMEOUT: 30000,
        BASE_URL: 'https://judge.ibasketball.co.il'
    }
};
