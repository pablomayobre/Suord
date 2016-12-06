const { ipcMain: ipc, webContents } = require('electron');

const comm = {};

comm.send = (thread, channel, message) => {
  webContents.fromId(comm.ids[thread]).send(channel, message);
};

// Debugging
comm.debug = (debug) => {
  ipc.once('debug', ({ sender }, arg) => {
    if (arg === 'ready') sender.send('debug', debug);
  });
};

// Updates
const update = require('./update.js');

ipc.once('updates', ({ sender }, arg) => {
  if (arg === 'ready') {
    update.onChecking = () => sender.send('updates-checking');
    update.onChecked = found => sender.send('updates-checked', found);
    update.onDownload = download => sender.send('updates-downloaded', download);
  }
});

ipc.on('updates-check', () => update.check());

module.exports = comm;
