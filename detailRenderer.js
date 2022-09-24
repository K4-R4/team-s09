document.getElementById('save').addEventListener(('click'), async () => {   
    let data = document.getElementById('data').value
    let deadline = document.getElementById('deadline').value
    await window.api.save(data,deadline)
})
document.getElementById('data').focus();