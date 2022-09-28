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
const { contextIsolated } = require('process')
const store = new Store()

const db = new sqlite3.Database("./todo.db")

const ORIGINAL_WALLPAPER_PATH = path.join(__dirname, '../images/originalWallpaper.jpg')
const BASE_WALLAPAER_PATH = path.join(__dirname, '../images/baseWallpaper.jpg')
const MODIFIED_WALLPAPER_PATH = path.join(__dirname, '../images/modifiedWallpaper.jpg')
const PREVIEW_BASE_WALLPAPER_PATH = path.join(__dirname, '../images/previewBaseWallpaper.jpg')
const DEFAULT_FONT_PATH = path.join(__dirname, '../fonts/defaultFont.ttf')
const PREVIEW_FONT_PATH = path.join(__dirname, '../fonts/previewFontFile.ttf')

var settings = {}

async function loadSettings() {
  settings["taskPosition"] = store.get('taskPosition') || [0, 0]
  settings["taskFont"] = store.get('taskFont') || 32
  settings["lineSpacing"] = store.get('lineSpacing') || 0
}

function updateIndexHtml() {
  var sortsetting = store.get('sortsetting') || 'id'
  if (sortsetting === 'deadline'){
    db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks WHERE IsUseDeadline = true ORDER BY deadline",(err,IsUseDeadlineTrues)=>{
      if (err) throw err
      db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks WHERE IsUseDeadline = false",(err,IsUseDeadlineFalses) =>{
        if (err) throw err
        let allTasks = IsUseDeadlineTrues.concat(IsUseDeadlineFalses)
        createHtml({allTasks: allTasks, sortsetting:sortsetting}, './src/index.ejs', './dist/index.html')
        mainWindow.loadFile('./dist/index.html')
      })
    })
  }
  else
  {
    db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks ORDER BY ?", sortsetting, function(err, allTasks) {
      if (err) throw err
      createHtml({allTasks: allTasks, sortsetting: sortsetting}, './src/index.ejs', './dist/index.html')
      mainWindow.loadFile('./dist/index.html')
    })
  }
}

async function changeWallpaper() {
  //オリジナルの壁紙を保存し、タスクを書き込んだ壁紙に差し替える
  const originalWallpaperPath = await wallpaper.get()
    
  if (originalWallpaperPath != MODIFIED_WALLPAPER_PATH) {
    fs.copyFileSync(originalWallpaperPath, ORIGINAL_WALLPAPER_PATH)
  }
  await wallpaper.set(MODIFIED_WALLPAPER_PATH)
}

async function printTasksOnBaseWallpaper(params, baseWallpaperPath, fontFilePath, outputFile, callback) {
  db.all("SELECT text, deadline, IsUseDeadline FROM tasks WHERE display = true", async function (dbErr, tasks) {

    if (dbErr) throw dbErr

    const image = await sharp(baseWallpaperPath)//
    const metadata = await image.metadata()

    let x = Number(metadata['width'] * params['taskPosition'][0] / 100)
    let y = Number(metadata['height'] * params['taskPosition'][1] / 100)
    let lineSpacing = Number(params['lineSpacing'])
    let fontSize = Number(params['taskFont'])

    const MAXWIDTH = 100000

    //http://modi.jpn.org/font_komorebi-gothic.php
    const fontFile = fontFilePath
    const textToSVG = text_to_svg.loadSync(fontFile)
    const svgOptions = {x: 0, y: 0, fontSize: fontSize, anchor: "left top", attributes: {fill: "black"}};
    let totalHeight = 0

    let svgBuffer = []

    //改行処理
    //tasksforeachでひとつずつ
    tasks.forEach(task => {
      let row = ""

      task['text'] = task['IsUseDeadline'] != 0? task['deadline'].replace(/-/g, "/") + " " + task['text']:task['text']
      let textInArray = Array.from(task['text'])
      //文字列が規定の幅を超えるなら改行する
      //一行の文字列をsvgデータの配列としてsvgBufferに保存する
      textInArray.forEach(char => {
          //行に新たに文字を加えた場合のwidth, heightを取得する
          //charが改行コードならtotalHeight += fontSize + lineSpacing
          const newRow = row + char
          const {width, height} = textToSVG.getMetrics(newRow, svgOptions)
          //widthが規定の幅を超えるならrowをsvgデータとして保存する
          //規定の幅を超えないならrowに文字を追加(newRow)してループする
          if (width > MAXWIDTH || char == '\n') {
            svgBuffer.push({svg: textToSVG.getSVG(row, svgOptions), top: totalHeight})
            row = char == '\n' ? "" : char
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
        left: Math.floor(x)
    }))

    await sharp(baseWallpaperPath)
        .composite(sharpOptions)
        .toFile(outputFile)

    await callback()
  })
}

function sendWebContents() {
  mainWindow.webContents.send('previewWallpaper')
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

  // and load the index.html of the app.
  window.loadFile(fileToLoad)
  return window
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  loadSettings()
  var sortsetting = store.get('sortsetting') || 'id'
  if (sortsetting === 'deadline'){
    db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks WHERE IsUseDeadline = true ORDER BY deadline",(err,IsUseDeadlineTrues)=>{
      if (err) throw err
      db.all("SELECT id, text, display ,deadline, IsUseDeadline FROM tasks WHERE IsUseDeadline = false",(err,IsUseDeadlineFalses) =>{
        if (err) throw err
        let allTasks = IsUseDeadlineTrues.concat(IsUseDeadlineFalses)
        createHtml({allTasks: allTasks, sortsetting: sortsetting}, './src/index.ejs', './dist/index.html')
        mainWindow = createWindow({
          width: 700,
          height: 600,
          webPreferences: {
            preload: path.join(__dirname, 'preload.js')
         }
        }, './dist/index.html')
      })
    })
  }else{
    db.all("SELECT id, text, display, deadline, IsUseDeadline FROM tasks", function(err, allTasks) {
      if (err) throw err
      createHtml({allTasks: allTasks, sortsetting: sortsetting}, './src/index.ejs', './dist/index.html')
      mainWindow = createWindow({
        width: 700,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      }, './dist/index.html')
    })
  }

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
    autoHideMenuBar: true,
    width: 340,
    height: 320,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  }, './src/html/detail.html')
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
  updateIndexHtml()
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
      autoHideMenuBar: true,
      width: 400,
      height: 350,
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
  updateIndexHtml()
})

/*TODO
delete function*/
ipcMain.handle("deleted",(event,task_id)=>{
  console.log("deltaskid: "+task_id)
  db.run("DELETE FROM tasks WHERE id = ?",task_id)
})

ipcMain.handle('openSettings', () => {
  fs.copyFileSync(BASE_WALLAPAER_PATH, PREVIEW_BASE_WALLPAPER_PATH)
  fs.copyFileSync(DEFAULT_FONT_PATH, PREVIEW_FONT_PATH)
  printTasksOnBaseWallpaper(settings, PREVIEW_BASE_WALLPAPER_PATH, PREVIEW_FONT_PATH, './src/images/output.jpg', sendWebContents)
  createHtml({settings: settings}, './src/settings.ejs', './dist/settings.html')
  mainWindow.loadFile('./dist/settings.html')
})

let selectedBaseWallpaper

ipcMain.handle('saveBaseWallpaper', async () => {
  selectedBaseWallpaper = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: '画像ファイル', extensions: ['jpg', 'png', 'gif']}]
  })
  if (selectedBaseWallpaper['canceled'] == false) {
    fs.copyFileSync(selectedBaseWallpaper['filePaths'][0], PREVIEW_BASE_WALLPAPER_PATH)
  }
  await mainWindow.webContents.send('selectedWallpaperPath', [selectedBaseWallpaper['filePaths'][0]])
})

let selectedFontFile

ipcMain.handle('saveFontFile', async () => {
  selectedFontFile = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'フォントファイル', extensions: ['ttf']}]
  })
  if (selectedFontFile['canceled'] == false) {
    fs.copyFileSync(selectedFontFile['filePaths'][0], PREVIEW_FONT_PATH)
  }
  await mainWindow.webContents.send('selectedFontFilePath', [selectedFontFile['filePaths'][0]])
})

ipcMain.handle('backToMainWindow', () => {
  updateIndexHtml()
})

ipcMain.handle('preview', (event, taskPosition, fontSize, lineSpacing) => {
  const previewSettings = {
    taskPosition: taskPosition,
    taskFont: fontSize,
    lineSpacing: lineSpacing
  }
  printTasksOnBaseWallpaper(previewSettings, PREVIEW_BASE_WALLPAPER_PATH, PREVIEW_FONT_PATH, './src/images/output.jpg', sendWebContents)
})

ipcMain.handle('saveSettings', (event, taskPosition, fontSize, lineSpacing) => {
  store.set('taskPosition', taskPosition)
  store.set('taskFont', fontSize)
  store.set('lineSpacing', lineSpacing)

  if (!(selectedBaseWallpaper == "undefined" || selectedBaseWallpaper == null)) {
    fs.copyFileSync(selectedBaseWallpaper['filePaths'][0], BASE_WALLAPAER_PATH)
  }
  if (!(selectedFontFile == "undefined" || selectedFontFile == null)) {
    fs.copyFileSync(selectedFontFile['filePaths'][0], DEFAULT_FONT_PATH)
  }
  loadSettings()
  updateIndexHtml()
  printTasksOnBaseWallpaper(settings, BASE_WALLAPAER_PATH, DEFAULT_FONT_PATH, MODIFIED_WALLPAPER_PATH, changeWallpaper)
})

ipcMain.handle('displayTasks', async () => {
  await printTasksOnBaseWallpaper(settings, BASE_WALLAPAER_PATH, DEFAULT_FONT_PATH, MODIFIED_WALLPAPER_PATH, changeWallpaper)
})

ipcMain.handle('restoreOriginalWallpaper', async () => {
  await wallpaper.set(ORIGINAL_WALLPAPER_PATH);
})

ipcMain.handle('sortHTML',(event, sortname) => {
  if (['id', 'UpdatedAt', 'deadline'].includes (sortname)) {
    store.set('sortsetting',sortname)
    updateIndexHtml()
  }
})