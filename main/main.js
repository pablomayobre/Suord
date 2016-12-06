const electron = require('electron');
const squirrel = require('./squirrel.js');

const { app, dialog } = electron;

// Squirrel Handler
if (squirrel) {
  app.quit();
  // return;
}

const debug = require('./debug.js');

debug({ enabled: true, developerTools: true });

const update = require('./update.js');
const windows = require('./windows.js');
const comm = require('./communication.js');

update.onDownload = (bool) => {
  if (bool) {
    dialog.showMessageBox(windows.thread.main, {
      type: 'info',
      buttons: ['Aceptar'],
      title: 'Nueva actualización',
      message: 'Esta se instalará la proxima vez que habra Suord',
    });
  }
};

comm.ids = windows.ids;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  windows.createMain();
  update.check();
  update.periodic(30 * 60 * 1000); // Check every 30 minutes
  comm.debug(debug.isDevEnabled());
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.threads.main === null) windows.createMain();
});

app.on('will-quit', () => {
  if (update.isDownloading) {
    update.onDownload = () => app.quit();
  }
});
