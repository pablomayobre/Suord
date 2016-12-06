const electron = require('electron');

const { BrowserWindow } = electron;
let screen;

const windows = {
  thread: {},
  ids: {},
};

windows.createMain = () => {
  // Get screen size
  screen = screen || electron.screen;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  windows.thread.main = new BrowserWindow({
    title: 'Suord',
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#03a9f4',
    offscreen: true,
    width,
    height,
  });

  const main = windows.thread.main;

  windows.ids.main = main.webContents.id;

  main.setMenu(null);

  // Load the index.html of the app.
  main.loadURL(`file://${__dirname}/gui/index.html`);

  main.once('ready-to-show', () => {
    main.maximize();
  });

  // Emitted when the window is closed.
  main.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    windows.thread.main = null;
  });
};

module.exports = windows;
