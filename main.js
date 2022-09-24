// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3')
const ejs = require('ejs')
const fs = require('fs')
const wallpaper = require('wallpaper')
const Store = require('electron-store')
const sharp = require('sharp');
const text_to_svg = require('text-to-svg')
const store = new Store()

const db = new sqlite3.Database("./todo.db")

var settings = {}

async function loadSettings() {
  settings["taskPosition"] = store.get('taskPosition') || [0, 0]
  settings["taskFont"] = store.get('taskFont') || 32
  settings["lineSpacing"] = store.get('lineSpacing') || 0

  const image = await sharp('./baseWallpaper.jpg')
  const metadata = await image.metadata()
  settings['baseWallpaperSize'] = [metadata['width'], metadata['height']]
}

function updateMainWindow() {
  db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks", function(err, allTasks) {
    if (err) throw err
    createHtml({allTasks: allTasks}, './src/index.ejs', './dist/index.html')
    mainWindow.loadFile('./dist/index.html')
  })
}

// Create html file from ejs template
// 引数dataToPassはテンプレートに渡す値を{key: value, key1: value1}のような連想配列で記述
// templateFile, outputFileはそれぞれテンプレートのパスと作成されるhtmlファイルのパス
function createHtml(dataToPass, templateFile, outputFile) {
  ejs.renderFile(templateFile, dataToPass, function(renderErr, html){
    if (renderErr) throw renderErr
    // ejsから作成したhtmlソースをテキストファイルに書き込む
    fs.writeFileSync(outputFile, String(html), 'utf8', (writeErr) => {
      if (writeErr) throw writeErr
    });
  });
}

function createWindow(windowOptions, fileToLoad) {
  // Create the browser window.

  const window = new BrowserWindow(windowOptions)
  if (fileToLoad === './dist/index.html'){
  }
  // and load the index.html of the app.
  window.loadFile(fileToLoad)
  return window
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  loadSettings()
  db.all("SELECT id, text, display, deadline, IsUseDeadline FROM tasks", function(err, allTasks) {
    if (err) throw err
    createHtml({allTasks: allTasks}, './src/index.ejs', './dist/index.html')
    mainWindow = createWindow({
      width: 600,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    }, './dist/index.html')
  })

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
  createWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  }, './detail.html')
  return
})

// Save data to the database
ipcMain.handle('save', (event, data,deadline) => {
  if (data.length === 0) {
    return dialog.showErrorBox("", "入力がありません")
  }
  deadline = deadline != null? deadline:Date.now()
  const IsUseDeadline = deadline != null? 1:0
  db.run("INSERT INTO tasks (text, display, UpdatedAt, deadline, IsUseDeadline) values(?, ?, ?, ?, ?)", data, false, Date.now(), deadline, IsUseDeadline)
  // Close window after saving data
  const currentWindow = BrowserWindow.getFocusedWindow()
  updateMainWindow()
  currentWindow.close()

})


/*TODO
toddle disply function*/
ipcMain.handle('toggleDisplay', (event, taskId) => {
  db.get("SELECT display FROM tasks WHERE id = ?", taskId, (err, row) => {
    if (err) throw err
    let displayOrNot = row['display']
    displayOrNot = displayOrNot === 0 ? 1:0
    console.log(taskId + " toggle disply " + (displayOrNot === 1 ? "on" : "off"))
    db.run("UPDATE tasks SET display = ? WHERE id = ?", displayOrNot, taskId)
  })
  return
})


/*TODO
edit function*/
ipcMain.handle('edit', (event, task_id) => {
  db.get("SELECT id, text ,deadline, IsUseDeadline FROM tasks WHERE id = ?", task_id, (err, task) => {
    if (err) throw err
    if (task.IsUseDeadline === 0){
      task.deadline = null
    }
    createHtml({task: task}, './src/edit.ejs', './dist/edit.html')
    createWindow({
      width: 400,
      height: 300,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    }, './dist/edit.html')
  })
})

ipcMain.handle('saveChange', (event, task_id, data, deadline) => {
  deadline = deadline != null? deadline:Date.now()
  const IsUseDeadline = deadline != null? 1:0
  db.run("UPDATE tasks SET text = ? ,deadline = ?, IsUseDeadline = ? WHERE id = ?", data, deadline, IsUseDeadline,task_id)
  const currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close()
  updateMainWindow()
})

/*TODO
delete function*/
ipcMain.handle("deleted",(event,task_id)=>{
  console.log("deltaskid: "+task_id)
  db.run("DELETE FROM tasks WHERE id = ?",task_id)
})

ipcMain.handle('openSettings', () => {
  createHtml({settings: settings}, './src/settings.ejs', './dist/settings.html')
  mainWindow.loadFile('./dist/settings.html')
})

let selectedBaseWallpaper

ipcMain.handle('saveBaseWallpaper', async () => {
  selectedBaseWallpaper = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: '画像ファイル', extensions: ['jpg', 'png', 'gif']}]
  })
  await mainWindow.webContents.send('selectedWallpaperPath', [selectedBaseWallpaper['filePaths'][0]])
})

ipcMain.handle('backToMainWindow', () => {
  updateMainWindow()
})

ipcMain.handle('saveSettings', (event, taskPosition, fontSize, lineSpacing) => {
  store.set('taskPosition', taskPosition)
  store.set('taskFont', fontSize)
  store.set('lineSpacing', lineSpacing)
  if (!(selectedBaseWallpaper == "undefined" || selectedBaseWallpaper == null)) {
    fs.copyFileSync(selectedBaseWallpaper['filePaths'][0], path.join(__dirname, './baseWallpaper.jpg'))
  }
  loadSettings()
  updateMainWindow()
})

ipcMain.handle('displayTasks', () => {

  db.all("SELECT text, deadline, IsUseDeadline FROM tasks WHERE display = true", async function (dbErr, tasks) {

    if (dbErr) throw dbErr

    let x = Number(settings['baseWallpaperSize'][0] * settings['taskPosition'][0] / 100)
    let y = Number(settings['baseWallpaperSize'][1] * settings['taskPosition'][1] / 100)
    let lineSpacing = Number(settings['lineSpacing'])
    let fontSize = Number(settings['taskFont'])

    const MAXWIDTH = 100000

    //http://modi.jpn.org/font_komorebi-gothic.php
    const fontFile = "./komorebi-gothic.ttf";
    const textToSVG = text_to_svg.loadSync(fontFile)
    const svgOptions = {x: 0, y: 0, fontSize: fontSize, anchor: "left top", attributes: {fill: "black"}};
    let totalHeight = 0

    let svgBuffer = []

    tasks.forEach(task => {
      let row = ""
      task['text'] = task['IsUseDeadline'] != 0? task['text']+" "+task['deadline']:task['text']
      let textInArray = Array.from(task['text'])
      //文字列が規定の幅を超えるなら改行する
      //一行の文字列をsvgデータの配列としてsvgBufferに保存する
      textInArray.forEach(char => {
          //行に新たに文字を加えた場合のwidth, heightを取得する
          const newRow = row + char
          const {width, height} = textToSVG.getMetrics(newRow, svgOptions)
          //widthが規定の幅を超えるならrowをsvgデータとして保存する
          //規定の幅を超えないならrowに文字を追加(newRow)してループする
          if (width > MAXWIDTH) {
              svgBuffer.push({svg: textToSVG.getSVG(row, svgOptions), top: totalHeight})
              row = char
              totalHeight += height + lineSpacing
          } else {
              row = newRow
          }
      })
      //最後の改行を終えて残る保存されていない文字列をsvgデータとして保存する
      if (row.length > 0) {
          svgBuffer.push({svg: textToSVG.getSVG(row, svgOptions), top: totalHeight})
      }
      //項目ごとに改行する
      totalHeight += fontSize + lineSpacing
    })


    const sharpOptions = svgBuffer.map(rowData => ({
        input: Buffer.from(rowData.svg),
        top: Math.floor(y + rowData.top),
        left: x
    }))

    sharp('./baseWallpaper.jpg')
        .composite(sharpOptions)
        .toFile('./modifiedWallpaper.jpg')

    const originalWallpaperPath = await wallpaper.get()
    if (originalWallpaperPath != path.join(__dirname, './modifiedWallpaper.jpg')) {
      fs.copyFileSync(originalWallpaperPath, path.join(__dirname, './originalWallpaper.jpg'))
    }
    
    await wallpaper.set('modifiedWallpaper.jpg')

  })
})

ipcMain.handle('restoreOriginalWallpaper', async () => {
  await wallpaper.set(path.join(__dirname, './originalWallpaper.jpg'));
})