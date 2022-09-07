let updatedbtn = document.getElementById("updatedbtn");
updatedbtn.addEventListener("click", async () => {
    let stextarea = document.updated.stextarea.value;
    alert(stextarea);
    await window.api.save(data)
})


////
//
//let data = document.updated.stextarea.value;
//await window.api.save(data);
///var bool = document.updated.bool.value;
///var updatedtime = document.updated.updatedtime.value;
////