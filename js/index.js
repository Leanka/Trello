import includeHTML from "../js/htmlInjection.js";

window.onload = function(){
    includeHTML();
    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
}


