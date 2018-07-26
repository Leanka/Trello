import * as include from "./htmlInjection.js";
import * as tools from "./commonTools.js";

var localUserId;
var projectPath = '../project/';
var projectCardTemplatePath = "../views/partials/project-card.ejs";


window.onload = function(){
    setCurrentUserId();
    tools.loadAllComponents(document.querySelectorAll("[data-filepath]"));
    tools.loadAllProjects(localUserId, (item) => {insertItem(item)});


    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("myModal").addEventListener('keypress', (event) => {tools.onKeyPress(event, () => {getFormData()})})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})

}
function setCurrentUserId(){ //wrap into promiss
    let pathnameElements = window.location.pathname.split('/');
    localUserId = pathnameElements[pathnameElements.length - 1];
}

function getFormData(){
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    
    if(title.length > 0) {
        document.getElementById("title").value = ""; //clear fields after getting user input
        document.getElementById("description").value = "";
        document.getElementById("myModal").style.display = "none"; //hide form
        document.getElementById("new-project-button").focus()

        let item = {"title": title, "description":description, "parentKey":{"id":localUserId}}
        tools.createProject(item, (item)=>{insertItem(item)});
    } else {
        alert("Please enter project title!");
    }
}

function insertItem(item){
    //code for inserting project
    let newProjectId = item._key;
    let customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    
    include.singleHtmlElementInsert(projectCardTemplatePath, customContainer, document.getElementById("main-project-container")).then((projectCard) => {
        //fill project card with data
        let projectTitle = projectCard.getElementsByClassName("card-title")[0] 
        projectTitle.innerText = item._title;

        let projectDescription = projectCard.getElementsByClassName("card-text")[0]
        projectDescription.innerText = item._description

        makeElementUpdatable(projectDescription, () => {updateProject(newProjectId, projectCard)})
        makeElementUpdatable(projectTitle, () => {updateProject(newProjectId, projectCard)})


        let deleteButton = projectCard.getElementsByClassName("delete-project-button")[0];
        deleteButton.setAttribute("identifier", newProjectId)
        deleteButton.addEventListener("click", (event ) => {tools.removeItem(event, (event) => {tools.removeProject(event)})});

        let editButton = projectCard.getElementsByClassName("edit-project-button")[0];
        editButton.setAttribute("identifier", newProjectId)
        editButton.addEventListener("click", (event ) => {editProject(projectTitle, projectDescription)});


        let myTarget = projectCard.getElementsByTagName("a")[0]
        let loc = myTarget.getAttribute("href")
        myTarget.setAttribute("href", projectPath + newProjectId);
        
        addDropdownToggleListeners(projectCard);
        addHideDropDownMenuOnClick(projectCard)
    })
}

function makeElementUpdatable(element, callback){
    element.addEventListener("keypress", (event) => {
        if(element.contentEditable == "true"){
            tools.onKeyPress(event, callback)
        }
        })
}

function addDropdownToggleListeners(doc) {
    let buttons = doc.getElementsByClassName("dropdown-toggle");
    for(let item of buttons) {
        item.addEventListener("click", () => {dropdown(item)})
    }
}

function addHideDropDownMenuOnClick(doc) {
    let buttons = doc.getElementsByClassName("dropdown-item");
    for(let item of buttons) {
        item.addEventListener("click", () => {
            if(item.parentNode.classList.contains("show")){
                item.parentNode.classList.remove("show");
            }
        })
    }
}

function dropdown(item) {
    let dropdownMenu = item.nextElementSibling
    if(dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
    } else {
        dropdownMenu.classList.add("show");
    }
}

function editProject(projectTitleNode, projectDescriptionNode){
    projectTitleNode.contentEditable = true;
    projectDescriptionNode.contentEditable = true;
}

function updateProject(projectId, parentElement){
    let titleNode = parentElement.getElementsByClassName("card-title")[0];
    let descNode = parentElement.getElementsByClassName("card-text")[0];

    let title = titleNode.innerText.trim();
    let description = descNode.innerText.trim();

    if(title.length == 0){
        alert("Title cannot be empty!")
    }else{
        titleNode.contentEditable = false;
        descNode.contentEditable = false;
    
        tools.updateResource(projectId, "projects", {"description":description, "title":title})
    }
}



