/*TODO
edit function*/

document.getElementById('save').addEventListener('click', async () => {
    let data = document.getElementById('data').value
    let task_id = document.getElementById('save').value
    await window.api.saveChange(task_id, data)
})
document.getElementById('data').focus();