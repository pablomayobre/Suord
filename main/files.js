const fs = require('fs');
const { app, dialog } = require('electron');

// FIX THIS, On installation this file doesn't exist, we need to create it
// initialize it with a path, create all necessary files.
// That is probably gonna be in another module called install.
let config;
fs.readFile(`${app.getPath('userData')}/config.json`, 'utf-8', (err, data) => {
  if (err) throw err;
  config = JSON.parse(data);
});

const file = {
  mainDirectory: config.mainDirectory,
};

const selectedDirectory = function selectedDirectory(dir) {
  file.mainDirectory = dir;
};

file.chooseDirectory = (win) => {
  dialog.showOpenDialog(win, {
    title: 'Directorio para Suord',
    properties: ['openDirectory'],
    buttonLabel: 'Seleccionar',
  }, selectedDirectory);
};

module.exports = file;
