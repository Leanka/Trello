import * as tools from "../js/commonTools.js"

window.onload = function() {
    document.addEventListener("keypress", (event) => { tools.onKeyPress(event, () => { window.location.replace("index.html")})})
}