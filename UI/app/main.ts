import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { SerialPort } from 'serialport';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
    darkTheme: true,
    frame: false,
    transparent: false,
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(
      url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('minimize', () => {
    if (win) {
      win.blur();
      win.minimize();
    }
  });

  ipcMain.on('menubar:ismaximized', () => {
    if (win) {
      win.webContents.send('menubar:ismaximized', win.isMaximized());
    }
  });

  ipcMain.on('maximize', () => {
    if (win) {
      win.maximize();
      win.webContents.send('menubar:ismaximized', true);
    }
  });

  ipcMain.on('unmaximize', () => {
    if (win) {
      win.unmaximize();
      win.webContents.send('menubar:ismaximized', false);
    }
  });

  ipcMain.on('close', () => {
    if (win) {
      win.close();
    }
  });

  ipcMain.on('file:open_height_map', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
          { name: 'Height Map Files', extensions: ['json', 'map', 'hmap'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send('file:open_height_map', contents.toString());
      }
    }
  });

  ipcMain.on('file:open_raw_gcode', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
          { name: 'G-Code Files', extensions: ['gcode', 'cnc', 'nc'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send('file:open_raw_gcode', contents.toString());
      }
    }
  });

  ipcMain.on('file:open_contoured_gcode', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
          {
            name: 'G-Code Files',
            extensions: ['cgcode', 'gcode', 'cnc', 'nc'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send('file:open_contoured_gcode', contents.toString());
      }
    }
  });

  ipcMain.on('file:save_cgcode', async (event, gcode) => {
    if (win) {
      const result = await dialog.showSaveDialog(win, {
        filters: [
          { name: 'Contoured G-Code File', extensions: ['cgcode'] },
          {
            name: 'G-Code File',
            extensions: ['gcode'],
          },
          {
            name: 'CNC File',
            extensions: ['cnc'],
          },
          {
            name: 'Laser Engraving File',
            extensions: ['nc'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });
      if (!result.canceled) {
        const fpath = result.filePath;
        await fs.promises.writeFile(fpath, gcode);
      }
    }
  });

  let cncPort: SerialPort | undefined;
  let switchPort: SerialPort | undefined;

  ipcMain.on('serial:list_ports', async () => {
    const ports = await SerialPort.list();
    console.log('P', ports);
    if (win) {
      win.webContents.send('serial:list_ports', ports);
    }
  });

  ipcMain.on(
    'serial:set_cnc_port',
    async (event, path: string, baud: number) => {
      try {
        if (cncPort && cncPort.isOpen) {
          await new Promise<void>((resolve, reject) => {
            cncPort.close((err) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
        await new Promise<void>((resolve, reject) => {
          cncPort = new SerialPort(
            {
              path,
              baudRate: baud,
            },
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
        win.webContents.send('serial:set_cnc_port');
      } catch (e) {
        win.webContents.send('serial:set_cnc_port', e.toString());
      }
    }
  );

  ipcMain.on(
    'serial:set_switch_port',
    async (event, path: string, baud: number) => {
      try {
        if (switchPort && switchPort.isOpen) {
          await new Promise<void>((resolve, reject) => {
            switchPort.close((err) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
        await new Promise<void>((resolve, reject) => {
          switchPort = new SerialPort(
            {
              path,
              baudRate: baud,
            },
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
        win.webContents.send('serial:set_switch_port');
      } catch (e) {
        win.webContents.send('serial:set_switch_port', e.toString());
      }
    }
  );
} catch (e) {
  // Catch Error
  // throw e;
}
