// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { title } = require('process')
const { toUnicode } = require('punycode')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("./todo.db")

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function createDetailWindow() {
  const detailWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  detailWindow.loadFile('detail.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Open detail window
ipcMain.handle('detail', () => {
  createDetailWindow()
  return
})

// Save data to the database
ipcMain.handle('save', (event, data) => {
  console.log(data)
  db.run("INSERT INTO data (text, display, UpdatedAt) values(?, ?, ?)", data, false, Date.now())
  // Close window after saving data
  const currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close()
  return
})

//updateを作成したい

//id get complete
ipcMain.handle("update", (event, number) => {
  let id = number;
  console.log(id)
})


ipcMain.handle("updated", (event, stextarea) => {
  let text = stextarea;
  console.log(text)
})

//db.run("UPDATE data SET text = ? where id = ?", a, id)


//db.run("UPDATE data SET text = ?, display = ?, UpdatedAt = ? WHERE id = ?", data, false, Data.now(), 20);

/*
ipcMain.handle("", (引数) => {
  console.log()
  db.run

  ipcMain.handle("save", (event, data) => {
  console.log(data)
  db.run("UPDATE data SET text = ?, display = ?, UpdatedAt = ? WHERE id = ?", (data), false, Data.now(), 1);
})
})
*/

