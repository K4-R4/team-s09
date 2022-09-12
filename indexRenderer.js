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
toddle display function*/
/* taskIds[i]は、タスクが一覧表示されたhtml上でi番目の行(項目)に対応するデータベースのidを持ちます */
var taskIds = []
var tasks = document.querySelectorAll('.task-id')
for (let i = 0, len = tasks.length; i < len; i++) {
    taskIds.push(tasks[i].value)
}

/* displays[i].addEventListener('click', () => {
        window.api.toggleDisplay(taskIds[i])
    })
    i番目の行(項目)のdisplayボタンがクリックされた際に、
    その行に対応するデータベースのidを渡します*/
var displays = document.querySelectorAll('.display')
for (let i = 0, len = displays.length; i < len; i++) {
    displays[i].addEventListener('click', () => {
        window.api.toggleDisplay(taskIds[i])
    })
}


/*TODO
delete function*/ 

let deletes =document.querySelectorAll(".delete")
for (let i = 0, len = deletes.length; i < len; i++) {
    deletes[i].addEventListener('click',async () => {
        if (taskIds[i] === null){
            console.log("task_id=null")
        }else{
            await window.api.deleted(taskIds[i])
        }
    });
};

//update.js
if (document.title === "memo") {
    document.getElementById("editbtn").addEventListener("click", async () => {
        //alert("編集画面を開きます");
        let number = document.getElementById("number").value;
        await window.api.updated(number)
    })
}
