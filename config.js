// Configuration file for Basketball Referee Scheduler
require('dotenv').config();

module.exports = {
    // Set to true to enable real scraping, false for test mode
    ENABLE_REAL_SCRAPING: true,
    
    // Test credentials that will use mock data
    TEST_CREDENTIALS: ['12345', 'test123'],
    
    // Google API Configuration (from environment variables)
    GOOGLE_API: {
        API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyC-vbKctbvYC0dRp7OEEKF7AfA5GH9_hYc',
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '226898444057-cvngmad5l62jgr2vd270461k7qjca9ir.apps.googleusercontent.com'
    },
    
    // Selenium Configuration
    SELENIUM: {
        HEADLESS: process.env.HEADLESS_MODE !== 'false',
        TIMEOUT: parseInt(process.env.SELENIUM_TIMEOUT) || 30000,
        BASE_URL: 'https://judge.ibasketball.co.il'
    }
};
