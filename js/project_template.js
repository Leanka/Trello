
import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
import * as tools from "../js/commonTools.js";

window.onload = function(){
    var projectKey = tools.parseQuery(window.location.search);
    if(projectKey){
        localStorage.setItem("current", projectKey)
    }else{
        projectKey = localStorage.getItem("current")
    }

    tools.loadAllComponents(document.querySelectorAll("[data-filepath]")).then(() => {
        setCurrentProjectName()
    })
    
    loadAllLists(projectKey)

    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})
}

function setCurrentProjectName(){
    let current = localStorage.getItem("current")
    let project = tools.parseJsonToClassInstance(models.Project, localStorage.getItem(current));
    document.getElementById("current-project-title").innerText = project._title;
}

function loadAllLists(projectKey){
    for(let key in localStorage){
        if(key.includes("list")){ //check if item is a list
            let list = tools.parseJsonToClassInstance(models.List, localStorage.getItem(key));
            if(list._parentKey == projectKey){ //check if list if from current project
                insertItem(list).then((list) => {
                    loadAllTasks(key);
                })
            }
        }
    }
}

function loadAllTasks(listKey){
    for(let key in localStorage){
        if(key.includes("task-")){
            let task = tools.parseJsonToClassInstance(models.Task, localStorage.getItem(key));
            if(task._parentKey == listKey){
                insertTask(task);
            }
        }
    }
}


function getFormData(){
    let title = document.getElementById("title").value;
    if(title.length > 0) {
        document.getElementById("title").value = ""; //clear fields after getting user input
        document.getElementById("myModal").style.display = "none"; //hide form

        var projectKey = localStorage.getItem("current");
        tools.createItem(new models.List("list-"+tools.getCounter(),title, projectKey), (item)=>{insertItem(item)});
    } else {
        alert("List title cannot be empty!");
    }
}

function insertItem(item){
    return new Promise((resolve, reject) => {
            //code for inserting project
            let newProjectId = item._key;
            let customContainer = document.createElement("div");
            customContainer.setAttribute("id", newProjectId)
            customContainer.setAttribute("class", "col-3");
            customContainer.setAttribute("ondrop", "drop(event)");
            customContainer.setAttribute("ondragover", "allowDrop(event)");
    
            
            include.singleHtmlElementInsert("../html/list-template.html", customContainer, document.getElementById("main-project-container")).then((list) =>{
                // //fill project card with data
                list.querySelectorAll("span.title-field")[0].innerText = item._title; //setting title
                list.getElementsByClassName("todo-list")[0].setAttribute("identifier", newProjectId)
                                                                
                var inputField = list.getElementsByClassName("list-title")[0].nextElementSibling; //adding new event
                inputField.addEventListener('keypress', (event) => {onKeyPress(event)})
                
                list.getElementsByTagName("input")[0].setAttribute("identifier", newProjectId); //input

                setTrashSettings(list, newProjectId, true);
                resolve(list);
            })
            .catch(err => console.error(err));
        })
    
}

function onKeyPress(event){
    let key = event.which || event.keyCode;
    const enterKeyCode = 13;
    if (key === enterKeyCode) {
        addNewTaskToList(event);
    }
}

function insertTask(task){
    var newItemId = task._key;

    let customContainer = document.createElement("li");
    customContainer.setAttribute("class", "task");
    customContainer.setAttribute("draggable", "true");
    customContainer.setAttribute("ondragstart", "drag(event)");
    customContainer.setAttribute("id", newItemId)

    let destinationContainer = document.querySelectorAll(`#${task._parentKey} ul`)[0];
    include.singleHtmlElementInsert("../html/task-template.html", customContainer, destinationContainer).then((taskContainer) => {
        taskContainer.getElementsByClassName("task-title")[0].innerText = task._title;
        setTrashSettings(taskContainer, newItemId, false)
    })

}

function setTrashSettings(container, itemId, confirmation){
    let trash = container.getElementsByClassName("del-item")[0];
    trash.setAttribute("identifier", itemId)
    if(confirmation){
        trash.addEventListener("click", (event) => {tools.removeItem(event, confirmation)});
    }else{
        trash.addEventListener("click", (event) => {tools.silentRemove(event)});
    }
}

function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var listId = ev.target.getAttribute("identifier");
  ev.target.value = '';
    if(taskTitle.length > 0) {
    tools.createItem(new models.Task(`task-${tools.getCounter()}`, taskTitle, listId), (task) => {insertTask(task)})
    } else {
        alert("Task name cannot be empty!");
    }
}

function addKeyListenersToInputs() {
    var newTaskInputs = document.getElementsByName("newTask");
    for(var i=0; i < newTaskInputs.length; i++) {
        newTaskInputs[i].addEventListener('keypress', function (ev) {
            var key = ev.which || ev.keyCode;
            const enterKeyCode = 13;
            if (key === enterKeyCode) {
              addNewTaskToList(ev);
            }
        });
    }
}

window.allowDrop = function(ev) {
    ev.preventDefault();
}

window.drag = function(ev) {
    ev.dataTransfer.setData("text/html", ev.target.id);
}

window.drop = function(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text/html");
    let ulIndex = 4;
    ev.dataTransfer.dropEffect = "move";

    if(ev.target.id.startsWith("list")) {
         ev.target.childNodes[ulIndex].appendChild(document.getElementById(data));
    } else if(ev.target.id.includes("list")) {
         ev.target.parentNode.appendChild(document.getElementById(data));   
    }
}

addKeyListenersToInputs(); //do onloada
