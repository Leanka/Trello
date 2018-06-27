import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
import * as tools from "../js/commonTools.js";


window.onload = function(){
    tools.loadAllComponents(document.querySelectorAll("[data-filepath]"));
    loadAllProjects();
    
    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})
}

function loadAllProjects(){
    for(let key in localStorage){
        if(key.includes("project")){
            tools.createItem(tools.parseJsonToClassInstance(models.Project, localStorage.getItem(key)), (item)=>{insertItem(item)})
        }
    }
}

function getFormData(){
    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;

    document.getElementById("title").value = ""; //clear fields after getting user input
    document.getElementById("description").value = "";
    document.getElementById("myModal").style.display = "none"; //hide form
    tools.createItem(new models.Project(`project-${tools.getCounter()}`, title, description), (item)=>{insertItem(item)});
}

function insertItem(item){
    //code for inserting project
    let newProjectId = item._key;
    let customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    
    include.singleHtmlElementInsert("../html/project-card.html", customContainer, document.getElementById("main-project-container")).then(() => {
        //fill project card with data
        let doc = document.getElementById(newProjectId);
        doc.getElementsByClassName("card-title")[0].innerText = item._title
        doc.getElementsByClassName("card-text")[0].innerText = item._description

        let deleteButton = doc.getElementsByClassName("delete-project-button")[0];
        deleteButton.setAttribute("identifier", newProjectId)

        let myTarget = doc.getElementsByTagName("a")[0]
        let loc = myTarget.getAttribute("href")
        myTarget.setAttribute("href", loc + '?key=' + newProjectId);
        
        addDropdownToggleListeners(doc);
        addDropdownMenuActionListeners(doc);
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
        button.addEventListener("click", (event) => {tools.removeItem(event, (identifier) => {removeProjectToDoLists(identifier)})});
    }
    //IMPLEMENT EDIT LISTENERS
}

function removeProjectToDoLists(projectKey) {
    for(let key in localStorage){
        if(key.includes("list-")){
            let list = tools.parseJsonToClassInstance(models.List, localStorage.getItem(key));
            if(list._parentKey == projectKey){
                localStorage.removeItem(key);
            }
        }
    }
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

