document.getElementById("updatedbtn").addEventListener("click", async () => {
    let stextarea = document.getElementById("stextarea").value
    alert(stextarea)
    window.close("./updated.html")
    window.api.updateds(stextarea)
})

