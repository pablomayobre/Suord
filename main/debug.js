const electron = require('electron');
// const localShortcut = require('electron-localshortcut');
const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// const isMacOS = process.platform === 'darwin';

function devTools(mainWindow) {
  const win = mainWindow || BrowserWindow.getFocusedWindow();

  if (win) {
    win.toggleDevTools();
  }
}

function openDevTools(mainWindow, showDevTools) {
  const win = mainWindow || BrowserWindow.getFocusedWindow();

  if (win) {
    const mode = showDevTools === true ? undefined : showDevTools;
    win.webContents.openDevTools({ mode });
  }
}

function refresh(mainWindow) {
  const win = mainWindow || BrowserWindow.getFocusedWindow();

  if (win) {
    win.webContents.reloadIgnoringCache();
  }
}

/*
function inspectElements() {
  const win = BrowserWindow.getFocusedWindow();
  const inspect = () => {
    win.devToolsWebContents.executeJavaScript('DevToolsAPI.enterInspectElementMode()');
  };

  if (win) {
    if (win.webContents.isDevToolsOpened()) {
      inspect();
    } else {
      win.webContents.on('devtools-opened', inspect);
      win.openDevTools();
    }
  }
}
*/

let isDevEnabled = true;

module.exports = (options) => {
  const opts = Object.assign({
    enabled: null,
    showDevTools: false,
  }, options);

  if (opts.enabled === false || (opts.enabled === null && !isDev)) {
    isDevEnabled = false;
    return;
  }

  app.on('browser-window-created', (e, win) => {
    if (opts.showDevTools) {
      openDevTools(win, opts.showDevTools);
    }
  });

  app.on('ready', () => {
    // activate devtron for the user if they have it installed and it's not already added
    try {
      const devtronAlreadyAdded = BrowserWindow.getDevToolsExtensions &&
        {}.hasOwnProperty.call(BrowserWindow.getDevToolsExtensions(), 'devtron');

      if (!devtronAlreadyAdded) {
        /* eslint global-require: off */
        BrowserWindow.addDevToolsExtension(require('devtron').path);
      }
    } catch (err) {
      /* eslint no-empty-block: off */
    }

    /*
    localShortcut.register('CmdOrCtrl+Shift+C', inspectElements);
    localShortcut.register(isMacOS ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', devTools);
    localShortcut.register('F12', devTools);

    localShortcut.register('CmdOrCtrl+R', refresh);
    localShortcut.register('F5', refresh);
    */
  });
};

module.exports.refresh = refresh;
module.exports.devTools = devTools;
module.exports.openDevTools = openDevTools;
module.exports.isDev = () => {
  const a = isDev;
  return a;
};
module.exports.isDevEnabled = () => {
  const a = isDevEnabled;
  return a;
};
