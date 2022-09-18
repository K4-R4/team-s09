document.getElementById('saveSettings').addEventListener('click', async () => {
    let task_position_x = document.getElementById('task-position-x').value
    let task_position_y = document.getElementById('task-position-y').value
    window.api.saveSettings([task_position_x, task_position_y])
})