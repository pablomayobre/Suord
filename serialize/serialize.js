const { ipcRenderer } = require('electron');
const msgpack = require('msgpack-lite');
let secret = require('secret.js');

const crypto = window.crypto.subtle;

secret = new TextEncoder('utf-8').encode(`SUORD-219j128as81n2nd812h-${secret}-1has0912`);
// let string = new TextDecoder ('utf-8').decode(uint8array);

let key;

const assignKey = function assignKey(hashed) {
  key = hashed;
};

crypto.digest('SHA-256', secret).then((result) => {
  crypto.importKey('raw', result, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
    .then(assignKey, error => console.log(error));
});

const checkHash = function checkHash(file) {
  const hash = file.slice(0, 63);
  const rest = file.slice(64);

  return crypto.digest('SHA-256', rest).then((digest) => {
    if (digest !== hash) {
      throw new Error('El archivo ha sido corrompido externamente, por favor utilice un backup para reestablecerlo');
    }

    return rest;
  });
};

const decryptFile = function decryptFile(file) {
  return crypto.decrypt('AES-GCM', key, file);
};

const decodeFile = function decodeFile(file) {
  try {
    const passwords = msgpack.decode(new Uint8Array(file));
    return passwords;
  } catch (e) {
    throw new Error('Hubo un error al decodificar el archivo, puede que el mismo se haya dañado');
  }
};

const sendData = function sendData(passwords) {
  ipcRenderer.send('passwords-ready', passwords);
};

const sendError = function sendError(error) {
  ipcRenderer.send('passwords-error', error);
};

ipcRenderer.on('password-file', (file) => {
  checkHash(file)
    .then(decryptFile)
    .then(decodeFile)
    .then(sendData)
    .catch(sendError);
});
