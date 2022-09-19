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
/*var taskIds = []
var tasks = document.querySelectorAll('.task-id')
for (let i = 0, len = tasks.length; i < len; i++) {
    taskIds.push(tasks[i].value)
}*/

/* displays[i].addEventListener('click', () => {
        window.api.toggleDisplay(taskIds[i])
    })
    i番目の行(項目)のdisplayボタンがクリックされた際に、
    その行に対応するデータベースのidを渡します*/
    function displaybtn(taskid){
        window.api.toggleDisplay(taskid)
}

/*displaybuttonの色を変える*/
/*let buttonOff = document.getElementById("display0").onclick = function () {
    this.classList.toggle('offon');
};
let buttonOn = document.getElementById("display1").onclick = function () {
    this.classList.toggle('onoff');
};*/

/*TODO
edit function*/
function editbtn(taskid){
    window.api.edit(taskid)
}


/*TODO
delete function*/ 

async function deletebtn(taskid){
    if (taskid === null){
        console.log("task_id=null")
    }else{
        await window.api.deleted(taskid)  
        document.getElementById(taskid).remove()
    }
    }
        

document.getElementById('openSettings').addEventListener('click', () => {
    window.api.openSettings()
})

document.getElementById('displayTasks').addEventListener('click', async () => {
    await window.api.displayTasks()
})

document.getElementById('restoreOriginalWallpaper').addEventListener('click', async () => {
    await window.api.restoreOriginalWallpaper()
})

//追加された内容を表示
window.api.addHTML((_event, value) => {
    const place = document.getElementById(value["insert_place_id"])
    console.log("additional")
    console.log(value)
    let add_elements = `<tr id=${value["id"]}"> \n<td><li>${value["text"]}</li></td> \n<td>\n<input class="task-id" type="hidden" value="${value["id"]}">\n<button class="display" type="button" id="display0">display</button>\n</td>\n<td>\n<button class="edit" type="button">edit</button>\n </td>\n<td>\n<button class="delete" type="button">delete</button>\n</td>\n</tr>\n`
    place.insertAdjacentHTML('afterend',add_elements)
})

//listのボタンの機能をまとめたもの。動的なHTMLの挿入でもボタンが機能
document.addEventListener('click',function(e){
    if(e.target ){
        const taskid = e.target.parentElement.parentElement.getAttribute("id")
        const classes = e.target.getAttribute('class') != null? e.target.getAttribute('class').split(" ") : null
        console.log(taskid , classes)
        if (classes === null){
            return
        }
        else if(classes.includes('display')){
          displaybtn(taskid)
          if (classes.includes('display0')){
            e.target.classList.toggle('offon')
          }else if(classes.includes('display1')){
            e.target.classList.toggle('onoff')
          }
        }else if(classes.includes('edit')){
            editbtn(taskid)
        }else if(classes.includes('delete')){
            console.log("del")
            deletebtn(taskid)
        }
    }
 })
