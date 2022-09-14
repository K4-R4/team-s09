document.getElementById('save').addEventListener(('click'), async () => {   
    let data = document.getElementById('data').value
    await window.api.save(data)
})
document.getElementById('data').focus();