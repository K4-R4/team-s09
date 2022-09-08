document.getElementById("updatedbtn").addEventListener("click", async () => {
    let stextarea = document.getElementById("stextarea").value
    alert(stextarea)
    window.close("./updated.html")
    window.api.updateds(stextarea)
})



////
//
//let data = document.updated.stextarea.value;
//await window.api.save(data);
///var bool = document.updated.bool.value;
///var updatedtime = document.updated.updatedtime.value;
////