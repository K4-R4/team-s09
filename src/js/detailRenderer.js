document.getElementById('save').addEventListener(('click'), async () => {   
    let data = document.getElementById('data').value
    data = data.trim()//空白処理
    let deadline = document.getElementById('deadline').value
    await window.api.save(data,deadline)
})
document.getElementById('data').focus();