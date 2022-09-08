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
if (document.title === "memo") {
    document.getElementById("editbtn").addEventListener("click", async () => {
        //alert("編集画面を開きます");
        let number = document.getElementById("number").value;
        await window.api.updated(number)
    })
}
else if (document.title === "updated") {
    document.getElementById("updatebtn").addEventListener("click", async () => {
        let stextarea = document.updated.stextarea.value
        await updateds(stextarea)
        window.close("./updated.html")
    })
}


/*
var editbtn = document.getElementById("editbtn");

        //window.open("./updated.html", "", "width=300,height=300");
 
editbtn.addEventListener("click", async () => {
    //alert("編集画面を開きます");
    let number = document.getElementById("number").value;
    await window.api.updated(number)
    window.open("./updated.html", "", "width=300,height=300");
})*/

/*        
let stextarea = document.updated.stextarea.value;
        window.close("./updated.html")
var updatedbtn = document.getElementById("updatedbtn"); */

