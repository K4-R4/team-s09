/*TODO
edit function*/

document.getElementById("updatedbtn").addEventListener("click", async () => {
    let stextarea = document.getElementById("stextarea").value
    window.close("./updated.html")
    await window.api.updatedbtn(stextarea)


})