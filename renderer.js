// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
document.addEventListener('DOMContentLoaded', () => {
    if (document.title === "memo") {
        document.getElementById('add').addEventListener('click', async () => {
            await window.api.detail()
        })
    } else if (document.title === "detail") {
        document.getElementById('save').addEventListener(('click'), async () => {
            let data = document.getElementById('data').value
            await window.api.save(data)
        })
    }
})

//update.js

var editbtn = document.getElementById("editbtn");

editbtn.addEventListener("click", function () {
    //alert("編集画面を開きます");
    let number = document.getElementById("number").value;
    window.open("./updated.html", "", "width=300,height=300");
})


