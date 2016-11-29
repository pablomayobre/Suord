'use strict'

var electron = require('electron');
var app = electron.app;  // Module to control application life.

if(require('./electron-modules/squirrel-startup.js')) app.quit();

var BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

//Autoupdate
var dialog = electron.dialog;
var os = require('os');
var autoUpdater = require('electron-auto-updater');

var debug = require('./electron-modules/debug.js');
//var client = require('electron-connect').client;

debug({enabled: true, showDevTools: true});

var ipcMain = electron.ipcMain;
ipcMain.once("dev", function (e, arg){
    if (arg == "ready")
        e.sender.send("dev", debug.isDevEnabled());
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

var autoUpdate = function (win){
    if (debug.isDev())
        return;

    const platform = os.platform();
    if (platform === "linux")
        return;

    autoUpdater.addListener("update-available", function(e){
        console.log("update-available", e);
    });
    autoUpdater.addListener("error", function(e){
        console.log("error", e);
    });
    autoUpdater.addListener("checking-for-update", function(e){
        console.log("checking-for-update", e);
    });
    autoUpdater.addListener("update-not-available", function(e){
        console.log("update-not-available", e);
    });
    autoUpdater.addListener("update-downloaded", function (e, releaseNotes, releaseName, releaseDate, updateURL) {
        console.log("update-downloaded", e);
        dialog.showMessageBox(win, {
            title: "Actualización disponible",
            type: "info",
            detail: `La version ${releaseName} ya se ha descargado, y se instalará la proxima vez que abra Suord`,
        })
    });

    /*const version = app.getVersion()
    if (platform === "darwin")
        autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${platform}_${os.arch()}/${version}`)*/

    win.webContents.once("did-frame-finish-load", function(){
        autoUpdater.checkForUpdates();
    });
}

var createWindow = function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "Suord",
        minWidth: 800,
        minHeight: 600,
        show: false
    });

    mainWindow.setMenu(null);

    // Load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.once('ready-to-show', function () {
        mainWindow.maximize()
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    autoUpdate(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})
