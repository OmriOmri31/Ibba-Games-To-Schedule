// Electron Main Process - Basketball Referee Scheduler
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;
const PORT = 3006;

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Basketball Referee Scheduler',
        icon: path.join(__dirname, 'icon-192.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        backgroundColor: '#667eea',
        show: false // Don't show until ready
    });

    // Create a simple menu
    const menuTemplate = [
        {
            label: 'אפליקציה',
            submenu: [
                { 
                    label: 'רענן', 
                    accelerator: 'F5',
                    click: () => mainWindow.reload() 
                },
                { type: 'separator' },
                { 
                    label: 'יציאה', 
                    accelerator: 'Alt+F4',
                    click: () => app.quit() 
                }
            ]
        },
        {
            label: 'עזרה',
            submenu: [
                { 
                    label: 'אודות', 
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'אודות',
                            message: 'Basketball Referee Scheduler',
                            detail: 'גרסה 1.0.0\n\nמערכת לניהול לוח משחקים לשופטי כדורסל'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Load the app
    mainWindow.loadURL(`http://localhost:${PORT}`);

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Start the Express server
function startServer() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting Express server...');
        
        // Start server.js as a child process
        serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
            env: { ...process.env, ELECTRON: 'true' },
            stdio: 'inherit'
        });

        serverProcess.on('error', (err) => {
            console.error('❌ Failed to start server:', err);
            reject(err);
        });

        // Wait for server to be ready
        setTimeout(() => {
            console.log('✅ Server should be ready');
            resolve();
        }, 2000);
    });
}

// Stop the server when app quits
function stopServer() {
    if (serverProcess) {
        console.log('🛑 Stopping server...');
        serverProcess.kill();
        serverProcess = null;
    }
}

// App lifecycle
app.whenReady().then(async () => {
    try {
        await startServer();
        createWindow();
    } catch (error) {
        console.error('❌ Failed to start app:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    stopServer();
    // On macOS, apps stay open until explicitly quit
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    stopServer();
});

// Handle crashes gracefully
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    stopServer();
    app.quit();
});

