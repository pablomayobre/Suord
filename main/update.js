const os = require('os');
const { autoUpdater } = require('electron-auto-updater');
const debug = require('./debug.js');

const empty = () => {};

// The update module
const update = {
  isChecking: false,
  isDownloading: false,
  onChecking: empty,
  onChecked: empty,
  onDownload: empty,
  onErrors: empty,
};

// Check if updates are available
update.check = () => {
  if (update.isChecking === false) {
    update.onChecking();
    update.isChecking = true;
    autoUpdater.checkForUpdates();
  }
};

// Updates are not available for Linux nor when Debugging
const stub = () => {
  update.onChecked(false);
};

if (debug.isDev()) {
  update.check = stub;
}

const platform = os.platform();
if (platform === 'linux') update.check = stub;

/* // On Mac we need to set the Feed URL
const version = app.getVersion()
if (platform === "darwin")
  autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${platform}_${os.arch()}/${version}`)
*/

// Download complete
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseData, releaseURL) => {
  update.isDownloading = false;
  update.onDownload({
    notes: releaseNotes,
    name: releaseName,
    data: releaseData,
    url: releaseURL,
  });
});

// Updates not/available
autoUpdater.on('update-available', () => {
  update.isChecking = false;
  update.isDownloading = true;
  update.onChecked(true);
});
autoUpdater.on('update-not-available', () => {
  update.isChecking = false;
  update.onChecked(false);
});

// Error when checking or downloading
autoUpdater.on('error', (e) => {
  update.isChecking = false;
  update.isDownloading = false;
  update.onErrors(e);
  update.onChecked(false);
  update.onDownload(false);
});

// Check for updates periodically
let timeout;
update.periodic = (time) => {
  if (typeof time !== 'number') {
    clearInterval(timeout);
  } else {
    if (timeout) clearInterval(timeout);
    timeout = setInterval(update.check, time);
  }
};

module.exports = update;
