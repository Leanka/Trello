import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
import * as tools from "../js/commonTools.js";
var backend = "https://safe-crag-70832.herokuapp.com";
var backendUserId = "5b4c702aee258500141cd48c";
var localBackend = "http://192.168.0.45:8088";
var localUserId = "5b4b4e5c7bcc4f69875e1c51"


window.onload = function(){
    tools.loadAllComponents(document.querySelectorAll("[data-filepath]"));
    loadAllProjects();
    
    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("myModal").addEventListener('keypress', (event) => {tools.onKeyPress(event, () => {getFormData()})})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})
}

function loadAllProjects(){
    fetch(`${localBackend}/users/${localUserId}/projects`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let project of json){
            let current = new models.Project(
                project._id,
                project.title,
                project.description,
                project.author.id
            )
            insertItem(current);
            console.log('item :', current);
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

function getFormData(){
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    
    if((title.length > 0) && (description.length > 0)) {
        document.getElementById("title").value = ""; //clear fields after getting user input
        document.getElementById("description").value = "";
        document.getElementById("myModal").style.display = "none"; //hide form
        document.getElementById("new-project-button").focus()
        tools.createItem(new models.Project(`project-${tools.getCounter()}`, title, description), (item)=>{insertItem(item)});
    } else {
        alert("Please enter both project title and description!");
    }
}

function insertItem(item){
    //code for inserting project
    let newProjectId = item._key;
    let customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    
    include.singleHtmlElementInsert("../html/project-card.html", customContainer, document.getElementById("main-project-container")).then((projectCard) => {
        //fill project card with data
        projectCard.getElementsByClassName("card-title")[0].innerText = item._title
        projectCard.getElementsByClassName("card-text")[0].innerText = item._description

        let deleteButton = projectCard.getElementsByClassName("delete-project-button")[0];
        deleteButton.setAttribute("identifier", newProjectId)
        // deleteButton.addEventListener("click", (event) => {tools.removeItem(event, true)})

        let myTarget = projectCard.getElementsByTagName("a")[0]
        let loc = myTarget.getAttribute("href")
        myTarget.setAttribute("href", loc + '?key=' + newProjectId);
        
        addDropdownToggleListeners(projectCard);
        addDropdownMenuActionListeners(projectCard);
    })
}

function addDropdownToggleListeners(doc) {
    let buttons = doc.getElementsByClassName("dropdown-toggle");
    for(let item of buttons) {
        item.addEventListener("click", () => {dropdown(item)})
    }
}

function addDropdownMenuActionListeners(doc) {
    let deleteButtons = doc.getElementsByClassName("delete-project-button");
    let editButtons = doc.getElementsByClassName("edit-project-button");
    for(let button of deleteButtons) {
        button.addEventListener("click", (event) => {tools.removeItem(event, true)});
    }
    //IMPLEMENT EDIT LISTENERS
}

function dropdown(item) {
    let parent = item.parentNode;
    let menuIndex = 3;
    if(parent.className != "btn-group dropright show") {
        parent.className = "btn-group dropright show";
        parent.childNodes[menuIndex].className = "dropdown-menu show";
    } else {
        parent.className = "btn-group dropright";
        parent.childNodes[menuIndex].className = "dropdown-menu";
    }
}

