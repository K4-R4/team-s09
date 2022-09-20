document.getElementById('saveSettings').addEventListener('click', async () => {
    let task_position_x = document.getElementById('task-position-x').value
    let task_position_y = document.getElementById('task-position-y').value
    let fontSize = document.getElementById('fontSize').value
    let lineSpacing = document.getElementById('lineSpacing').value
    window.api.saveSettings([task_position_x, task_position_y], fontSize, lineSpacing)
})

document.getElementById('saveBaseWallpaper').addEventListener('click', () => {
    window.api.saveBaseWallpaper()
})

window.api.on('selectedWallpaperPath', (event, selectedWallpaperPath) => {
    document.getElementById('selectedWallpaperPath').innerHTML = selectedWallpaperPath
})

document.getElementById('backToMainWindow').addEventListener('click', async () => {
    window.api.backToMainWindow()
})