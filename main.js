const electron = require('electron');
const {autoUpdater} = require("electron-updater");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

    autoUpdater.checkForUpdatesAndNotify();
    let process_name = "app.exe";
    let DEBUG = true;
    let cwd = {cwd: "backend/dist/app"};
    if (fs.existsSync("resources/app")) {
        cwd = {cwd: "resources/app/"};
        DEBUG = false;
    }


    let subpy = require('child_process').spawn(process_name, cwd);
    let rq = require('request-promise');
    let mainAddr = 'http://localhost:8080';

    let openWindow = function () {
        mainWindow = new BrowserWindow({
            width: 800, height: 600, webPreferences: {
                nodeIntegration: false
            }
        });
        mainWindow.loadURL(mainAddr);
        if(DEBUG){
            mainWindow.webContents.openDevTools();
        }
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
