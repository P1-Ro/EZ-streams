const { Menu, app, BrowserWindow} = require('electron');
const {autoUpdater} = require("electron-updater");
const fs = require('fs');
const path = require("path");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let flagStore = {};

function clearCache(){
    if(fs.existsSync(flagStore.cwd + "cache.db")){
        fs.unlinkSync(flagStore.cwd + "cache.db");
    }
    mainWindow.webContents.session.clearStorageData();
    mainWindow.webContents.reload();
}

autoUpdater.on('update-downloaded', () => {
    clearCache()
});

function setCWD() {
    flagStore = {cwd: "backend/dist/app/"};
    flagStore.DEBUG = true;
    if (fs.existsSync("resources/app")) {
        flagStore = {cwd: "resources/app/"};
        flagStore.DEBUG = false;
    }
}

function createWindow() {

    autoUpdater.checkForUpdates();


    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    let process_name = "app.exe";
    setCWD();


    let subpy = require('child_process').spawn(process_name, flagStore);
    let rq = require('request-promise');
    let mainAddr = 'http://localhost:8080';

    let openWindow = function () {
        console.log(path.join(flagStore.cwd, "icon.png"));
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 600,
            backgroundColor: '#222',
            icon: path.join(flagStore.cwd, "icon.png"),
            webPreferences: {
                nodeIntegration: false
            }
        });
        mainWindow.maximize();
        mainWindow.loadURL(mainAddr);
        if (flagStore.DEBUG) {
            mainWindow.webContents.openDevTools();
        }
        mainWindow.webContents.on('new-window', function (event) {

            event.preventDefault();
        });
        mainWindow.on('closed', function () {
            mainWindow = null;
            subpy.kill('SIGINT');
        });
    };

    let startUp = function () {
        rq(mainAddr)
            .then(function () {
                console.log('server started!');
                openWindow();
            })
            .catch(function () {
                console.log('waiting for the server start...');
                startUp();
            });
    };

    startUp();
}

const template = [
    {
        label: "Tools",
        submenu: [
            {
                label: "Clear cache",
                click() {
                    clearCache();
                }
            },
        ]
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Open developer tools",
                click() {
                    mainWindow.webContents.openDevTools();
                }
            },
            {
                label: "See on GitHub",
                click() {
                    require('electron').shell.openExternal('https://github.com/P1-Ro/EZ-streams')
                }
            },
            {
                label: "About",
                click() {
                    const index_html = 'file://' + path.join(__dirname, 'dialogs', 'about.html');
                    let window = new BrowserWindow({
                        width: 400,
                        height: 400,
                        minimizable: false,
                        maximizable: false,
                        icon: path.join(flagStore.cwd, "icon.png"),
                        backgroundColor: '#222',
                        center: true
                    });
                    window.setMenu(null);
                    if(flagStore.DEBUG){
                        window.webContents.openDevTools({mode: "detach"});
                    }
                    window.loadURL(index_html);
                }
            },
        ]
    },
];

let shouldQuit = app.makeSingleInstance(function() {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    app.quit();
    return;
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});
