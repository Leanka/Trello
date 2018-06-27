
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
                tools.createItem(tools.parseJsonToClassInstance(models.List, localStorage.getItem(key)), (item)=>{insertItem(item)})
            }
        }
    }
}

function getFormData(){
    let title = document.getElementById("title").value;

    document.getElementById("title").value = ""; //clear fields after getting user input
    document.getElementById("myModal").style.display = "none"; //hide form

    var projectKey = localStorage.getItem("current");
    tools.createItem(new models.List("list-"+tools.getCounter(),title, projectKey), (item)=>{insertItem(item)});
}

function insertItem(item){
    //code for inserting project
    var newProjectId = `${item._key}`;
    var customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    customContainer.setAttribute("class", "col")
    
    include.singleHtmlElementInsert("../html/list-template.html", customContainer, document.getElementById("main-project-container")).then(() =>{

    // //fill project card with data
    var doc = document.getElementById(newProjectId)


    doc.querySelectorAll("span.title-field")[0].innerText = item._title;
    doc.getElementsByClassName("todo-list")[0].setAttribute("identifier", newProjectId)
                                                       
    var inputField = doc.getElementsByClassName("list-title")[0].nextElementSibling;
    inputField.addEventListener('keypress', function (ev) {
        var key = ev.which || ev.keyCode;
        const enterKeyCode = 13;
        if (key === enterKeyCode) {
            addNewTaskToList(ev);
        }
    });
    doc.getElementsByTagName("input")[0].setAttribute("identifier", newProjectId); //input

    let trash = doc.getElementsByClassName("list-trash")[0]; //trash
    trash.setAttribute("identifier", newProjectId)
    trash.addEventListener("click", (event) => {tools.removeItem(event)});
    })
}
function insertTask(task){
    var newItemId = task._key;

    let customContainer = document.createElement("li");
    customContainer.setAttribute("class", "task");
    customContainer.setAttribute("draggable", "true");
    customContainer.setAttribute("ondragstart", "drag(event)");
    customContainer.setAttribute("id", newItemId)

    let destinationContainer = document.querySelectorAll(`#${task._parentKey} ul`)[0];

    include.singleHtmlElementInsert("../html/task-template.html", customContainer, destinationContainer).then(() => {
        let newTaskContainer = document.getElementById(newItemId);
        newTaskContainer.getElementsByClassName("task-title")[0].innerText = task._title;

        let trash = newTaskContainer.getElementsByClassName("task-trash")[0];
        trash.setAttribute("identifier", newItemId)
        trash.addEventListener("click", (event) => {tools.silentRemove(event)});
    
    })

}

function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var listId = ev.target.getAttribute("identifier");
  ev.target.value = '';

  tools.createItem(new models.Task(`task-${tools.getCounter()}`, taskTitle, listId), (task) => {insertTask(task)})

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
};

window.allowDrop = function(ev) {
    ev.preventDefault();
}

window.drag = function(ev) {
    ev.dataTransfer.setData("text/html", ev.target.id);
}

window.drop = function(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text/html");
    ev.dataTransfer.dropEffect = "move";
    ev.target.parentNode.appendChild(document.getElementById(data));
}

addKeyListenersToInputs(); //do onloada?
