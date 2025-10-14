// electron-main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      // 为了最快集成本地JSON/资源读取，关闭同源限制（纯本地应用可用）
      webSecurity: false
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html'); // 直接加载你的入口页
  // 开发期需要的话可打开调试：win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
