// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { title } = require('process')
const { toUnicode } = require('punycode')
const sqlite3 = require('sqlite3')
const ejs = require('ejs')
const fs = require('fs')
const jimp = require('jimp')
const wallpaper = require('wallpaper')

const db = new sqlite3.Database("./todo.db")

// Create html file from ejs template
// 引数dataToPassはテンプレートに渡す値を{key: value, key1: value1}のような連想配列で記述
// templateFile, outputFileはそれぞれテンプレートのパスと作成されるhtmlファイルのパス
function createHtml(dataToPass, templateFile, outputFile) {
  ejs.renderFile(templateFile, dataToPass, function(renderErr, html){

    // 出力情報 => ejsから作成したhtmlソース
    if (renderErr) throw renderErr

    // テキストファイルに書き込む
    fs.writeFileSync(outputFile, String(html), 'utf8', (fileErr) => {
      if (fileErr) throw fileErr
    });
  });
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  db.all("SELECT id, text, display FROM data", function(err, allTasks) {
    if (err) throw err
    createHtml({allTasks: allTasks}, './src/index.ejs', './dist/index.html')
    // and load the index.html of the app.
    mainWindow.loadFile('./dist/index.html')
  })

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

  detailWindow.loadFile('./detail.html')
}

function creareUpdatewindow() {
  const updatewindow = new BrowserWindow({
    width: 300,
    height: 300,
    webPreferences: {
      pleload: path.join(__dirname, "preload.js")
    }
  })
  updatewindow.loadFile("updated.html")
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
  if (data.length === 0) {
    return dialog.showErrorBox("", "入力がありません")
  }
  db.run("INSERT INTO data (text, display, UpdatedAt) values(?, ?, ?)", data, false, Date.now())
  // Close window after saving data
  const currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close()
  return
})

/*TODO
toddle disply function*/
ipcMain.handle('toggleDisplay', (event, taskId) => {
  db.get("SELECT display FROM data WHERE id = ?", taskId, (err, row) => {
    if (err) throw err
    let displayOrNot = row['display']
    displayOrNot = displayOrNot === 0 ? 1:0
    console.log(taskId + " toggle disply " + (displayOrNot === 1 ? "on" : "off"))
    db.run("UPDATE data SET display = ? WHERE id = ?", displayOrNot, taskId)
  })
  return
})

/*TODO
edit function*/

//id get complete
ipcMain.handle("update", (event, number) => {
  creareUpdatewindow()
  console.log(typeof (number))
  let id = parseFloat(number)
  console.log(typeof (id))
  db.run("UPDATE data SET text = ? WHERE id = ?", number, id)
  return
})


ipcMain.handle("updatedbtn", (event, stextarea) => {
  console.log(stextarea)
  const currentupdatedWindow = BrowserWindow.getFocusedWindow()
  currentupdatedWindow.close()
  return
})

/*TODO
delete function*/
ipcMain.handle("deleted",(event,task_id)=>{
  console.log("delelement : " +task_id)
  db.run("delete from data where id = ?",task_id)
  
})

ipcMain.handle('displayTasks', () => {
  db.all("SELECT text FROM data WHERE display = true", function (dbErr, rows) {
    let x = 0
    let y = 0
    if (dbErr) throw dbErr
    let loadedImage
    // タスクを書き込む背景画像を読み込む
    jimp.read('baseWallpaper.jpg')
      .then(function (image) {
        loadedImage = image
        return jimp.loadFont(jimp.FONT_SANS_32_BLACK)
      })
      .then(function (font) {
        // タスクを書き込み背景画像を保存する
        for (let i = 0, len = rows.length; i < len; i++) {
          loadedImage.print(font, x, y, rows[i]["text"])
          y = y + 32 + 16
        }
        loadedImage.write('modifiedWallpaper.jpg')
        console.log("modified base wallpaper")
      })
      .then(function () {
        // 差し替える前の背景画像のパスを取得する
        return wallpaper.get()
      })
      .then(function (originalWallpaperPath) {
        // 取得したパスを用いてオリジナルの背景画像をコピーする
        console.log(originalWallpaperPath)
        console.log(path.join(__dirname, './originalWallpaper.jpg'))
        if (originalWallpaperPath != path.join(__dirname, './modifiedWallpaper.jpg')) {
          fs.copyFileSync(originalWallpaperPath, './originalWallpaper.jpg')
          console.log("saved original wallpaper")
        }
      })
      .then(function () {
        // タスクを書き込んだ背景画像に差し替える
        wallpaper.set('modifiedWallpaper.jpg')
        console.log("changed to modified wallpaper")
      })
      // エラーを出力
      .catch(function (err) {
        if (err) throw err
      })
  })
  return
})

ipcMain.handle('restoreOriginalWallpaper', async () => {
  await wallpaper.set('./originalWallpaper.jpg')
  return
})