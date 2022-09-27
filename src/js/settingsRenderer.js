let task_position_x = document.getElementById('task-position-x')
let task_position_y = document.getElementById('task-position-y')
let fontSize = document.getElementById('fontSize')
let lineSpacing = document.getElementById('lineSpacing')

task_position_x.addEventListener('change', async () => {
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

task_position_y.addEventListener('change', async () => {
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

fontSize.addEventListener('change', async () => {
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

lineSpacing.addEventListener('change', async () => {
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

window.api.on('previewWallpaper', () => {
    document.getElementById('previewWallpaper').src = "../src/images/output.jpg?" + new Date().getTime()
})

document.getElementById('saveSettings').addEventListener('click', async () => {
    window.api.saveSettings([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

document.getElementById('saveBaseWallpaper').addEventListener('click', () => {
    window.api.saveBaseWallpaper()
})

document.getElementById('saveFontFile').addEventListener('click', () => {
    window.api.saveFontFile()
})

window.api.on('selectedWallpaperPath', (event, selectedWallpaperPath) => {
    document.getElementById('selectedWallpaperPath').innerHTML = selectedWallpaperPath
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

window.api.on('selectedFontFilePath', (event, selectedFontFilePath) => {
    document.getElementById('selectedFontFilePath').innerHTML = selectedFontFilePath
    window.api.preview([task_position_x.value, task_position_y.value], fontSize.value, lineSpacing.value)
})

document.getElementById('backToMainWindow').addEventListener('click', async () => {
    window.api.backToMainWindow()
})