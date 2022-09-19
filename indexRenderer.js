// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

document.getElementById('add').addEventListener('click', async () => {
    await window.api.detail()
})


/*display function*/
function displaybtn(taskid){
        window.api.toggleDisplay(taskid)
}

/*edit function*/
function editbtn(taskid){
    window.api.edit(taskid)
}


/*delete function*/ 
async function deletebtn(taskid){
    if (taskid === null){
        console.log("task_id=null")
    }else{
        await window.api.deleted(taskid)  
        document.getElementById(taskid).remove()
    }
    }
        
//listのボタンの機能をまとめたもの.
document.addEventListener('click',function(e){
    if(e.target ){
        const taskid = e.target.parentElement.parentElement.getAttribute("id")
        const classes = e.target.getAttribute('class') != null? e.target.getAttribute('class').split(" ") : null
        console.log(taskid , classes)
        if (classes === null){
            return
        }
        //display
        else if(classes.includes('display')){
          displaybtn(taskid)
          if (classes.includes('display0')){
            e.target.classList.toggle('offon')
          }else if(classes.includes('display1')){
            e.target.classList.toggle('onoff')
          }
        }
        //edit
        else if(classes.includes('edit')){
            editbtn(taskid)
        }
        //delete
        else if(classes.includes('delete')){
            deletebtn(taskid)
        }
    }
 })

 
//背景画像の変更
document.getElementById('openSettings').addEventListener('click', () => {
    window.api.openSettings()
})

document.getElementById('displayTasks').addEventListener('click', async () => {
    await window.api.displayTasks()
})

document.getElementById('restoreOriginalWallpaper').addEventListener('click', async () => {
    await window.api.restoreOriginalWallpaper()
})

