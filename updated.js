
let updatedbtn = document.getElementById("updatedbtn");
updatedbtn.addEventListener("click", async () => {
    let stextarea = document.updated.stextarea.value;
    await window.api.updateds(stextarea)
    window.close("./updated.html")
})



////
//
//let data = document.updated.stextarea.value;
//await window.api.save(data);
///var bool = document.updated.bool.value;
///var updatedtime = document.updated.updatedtime.value;
////