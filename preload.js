// preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  version: '1.0.0'
});
