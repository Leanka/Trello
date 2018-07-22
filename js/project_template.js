import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
import * as tools from "../js/commonTools.js";
var currentProjectId;
var listTemplatePath = "../html/list-template.html";

window.onload = function(){
    setCurrentProjectId();

    tools.loadAllComponents(document.querySelectorAll("[data-filepath]")).then(() => {
        setCurrentProjectName()
    }).catch((err) => {console.log('err :', err);})

    tools.loadAllLists(currentProjectId, (list) => insertItem(list), (task) => insertTask(task));
    // loadAllLists(projectKey)

    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("myModal").addEventListener('keypress', (event) => {tools.onKeyPress(event, () => {getFormData()})})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})
    addKeyListenersToInputs();
}

function setCurrentProjectId(){ //wrap into promiss
    let pathnameElements = window.location.pathname.split('/');
    currentProjectId = pathnameElements[pathnameElements.length - 1];
}

function setCurrentProjectName(){
    tools.loadProjectTitle(currentProjectId, (title) => {
        document.getElementById("current-project-title").innerText = title;
    })
}

function getFormData(){
    let title = document.getElementById("title").value.trim();
    
    if(title.length > 0) {
        document.getElementById("title").value = ""; //clear fields after getting user input
        document.getElementById("myModal").style.display = "none"; //hide form

        let item = {"title": title, "parentKey":{"id":currentProjectId}}
        tools.createList(item, (item)=>{insertItem(item)});
    } else {
        alert("List title cannot be empty!");
    }
}

function insertItem(item){
    return new Promise((resolve, reject) => {
            // code for inserting project
            let newProjectId = item._key;
            let customContainer = document.createElement("div");
            
            customContainer.setAttribute("id", newProjectId)
            customContainer.addEventListener("drop", function(ev){handleTaskDrop(ev, this.id)})
            
            customContainer.setAttribute("class", "col-3");
            customContainer.setAttribute("ondragover", "allowDrop(event)");
    
            include.singleHtmlElementInsert(listTemplatePath, customContainer, document.getElementById("main-project-container"))
            .then((list) =>{
                // fill project card with data
                list.querySelectorAll("span.title-field")[0].innerText = item._title; //setting title
                list.getElementsByClassName("todo-list")[0].setAttribute("identifier", newProjectId)
                list.getElementsByTagName("input")[0].setAttribute("identifier", newProjectId); //input
                setTrashSettings(list, newProjectId, (event) => {tools.removeList(event)},true);
            
                var inputField = list.getElementsByClassName("list-title")[0].nextElementSibling; //adding new event
                inputField.addEventListener('keypress', (event) => {tools.onKeyPress(event, () => {addNewTaskToList(event)})})

                resolve(list);
            })
            .catch(err => console.error(err));
        })
    
}

function insertTask(task){
    var newItemId = task._key;
    let customContainer = document.createElement("li");
    customContainer.setAttribute("class", "task");
    customContainer.setAttribute("draggable", "true");
    customContainer.setAttribute("ondragstart", "drag(event)");
    customContainer.setAttribute("id", newItemId)
    customContainer.addEventListener("dblclick", () => {strikeTask(newItemId)})
    

    let destinationContainer = document.getElementById(task._parentKey).getElementsByTagName("ul")[0];
    include.singleHtmlElementInsert("../html/task-template.html", customContainer, destinationContainer)
    .then((taskContainer) => {
        let taskNode = taskContainer.getElementsByClassName("task-title")[0];
        taskNode.innerText = task._title;

        if(task._status == "done"){
            taskNode.classList.add("cross-over");
        }

        setTrashSettings(taskContainer, newItemId,(event) => {
            tools.removeTask(event, () => {updateTasksOrderInList(destinationContainer.childNodes)})
        } ,false)

        tools.updateResource(newItemId, "tasks", {"position": destinationContainer.childElementCount-1})
    })

}

function strikeTask(taskId){
    let taskContainer = document.getElementById(taskId)
    let task = taskContainer.getElementsByClassName("task-title")[0];

    let newStatus;
    if(task.classList.contains("cross-over")){
        task.classList.remove("cross-over");
        newStatus = {"status":"todo"};
    }else{
        task.classList.add("cross-over");
        newStatus = {"status":"done"};
    }
    tools.updateResource(taskId, "tasks", newStatus)
}

function setTrashSettings(container, itemId, removeResource, confirmation){
    let trash = container.getElementsByClassName("del-item")[0];
    trash.setAttribute("identifier", itemId)

    if(confirmation){
        trash.addEventListener("click", (event) => {tools.removeItem(event, removeResource)});
    }else{
        trash.addEventListener("click", (event) => {removeResource(event)});
    }
}

function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var listId = ev.target.getAttribute("identifier");

  ev.target.value = '';
    if(taskTitle.length > 0) {
        let item = {"title": taskTitle, "parentKey":{"id":listId}};
        tools.createTask(item, (task) => {insertTask(task)})
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
    updateTasksOrderInList(ev.target.parentNode.childNodes)
}

function handleTaskDrop(ev, id){
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text/html");
    ev.dataTransfer.dropEffect = "move";

    let destinationNode = document.getElementById(id).getElementsByTagName("ul")[0]
    let elementName = ev.target.tagName;

    if(elementName == "P"){
        destinationNode.insertBefore(document.getElementById(data), ev.target.parentNode)
        updateTasksOrderInList(destinationNode.childNodes)
    }else if(elementName == "LI"){
        destinationNode.insertBefore(document.getElementById(data), ev.target)
        updateTasksOrderInList(destinationNode.childNodes)
    }else{
        destinationNode.appendChild(document.getElementById(data));
        tools.updateResource(data, "tasks", {"position": destinationNode.childElementCount-1}) //len of list -1 - item is already there, position values start at 0, not 1
    }
    tools.updateResource(data, "tasks", {"parentKey": {"id": id}});
}

function updateTasksOrderInList(tasksList){
    let index = 0;
    for(let task of tasksList){
        let taskId = task.getAttribute("id");
        tools.updateResource(taskId, "tasks", {"position":index})
        ++index
    }
}
