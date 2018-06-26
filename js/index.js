import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
import * as tools from "../js/commonTools.js";


window.onload = function(){
    tools.loadAllComponents(document.querySelectorAll("[data-filepath]")); //if there would be components from main container, add returning Promis.all
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
    tools.createItem(new models.Project("project-" + tools.getCounter(),title, description), (item)=>{insertItem(item)});
}

function removeItem(key) {
    let element = document.getElementById(key);
    element.parentNode.removeChild(element);
    localStorage.removeItem(key);
}

function insertItem(item){
    //code for inserting project
    var newProjectId = `${item._key}`;
    var customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    
    include.singleHtmlElementInsert("../html/project-card.html", customContainer, "main-project-container").then(() => {
        //fill project card with data
        let doc = document.getElementById(newProjectId);
        doc.getElementsByClassName("card-title")[0].innerText = item._title
        doc.getElementsByClassName("card-text")[0].innerText = item._description
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
        button.addEventListener("click", (event) => {deleteProject(event)});
    }
    //IMPLEMENT EDIT LISTENERS
}

function deleteProject(event) {
   let projectKey = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
   if(confirm('Remove project?')) {
       removeProjectToDoLists(projectKey);
       removeItem(projectKey);
   }
}

function removeProjectToDoLists(projectKey) {
    let listsToRemove = getProjectToDoLists(projectKey);
    for(let list of listsToRemove) {
        localStorage.removeItem(list);
    };
}

function getProjectToDoLists(projectKey) {
    let listsToRemove = [];
        for(var i=0, len=localStorage.length; i<len; i++) {
        let key = localStorage.key(i);
        if(key.includes("list")) {
            let value = localStorage[key];
            let listData = JSON.parse(value);
            if(listData._parentKey == projectKey) {
                listsToRemove.push(key);
            }
        }
    }
    return listsToRemove;
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

