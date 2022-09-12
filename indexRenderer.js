// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

document.getElementById('add').addEventListener('click', async () => {
    await window.api.detail()
})
/*TODO
delete function*/ 

let deletebtn =document.querySelectorAll(".delete")
deletebtn.forEach(target => {
    target.addEventListener('click',async () => {
        let task_id = target.value
        if (task_id === null){
            console.log("task_id=null")
        }else{
            console.log(target.value)
            await window.api.deleted(target.value)
        }
    
    });
});

//update.js
if (document.title === "memo") {
    document.getElementById("editbtn").addEventListener("click", async () => {
        //alert("編集画面を開きます");
        let number = document.getElementById("number").value;
        await window.api.updated(number)
    })
}
