
import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";
var tasksIdCounter = 10;

window.onload = function(){
    var projectKey = parseQuery(window.location.search);
    if(projectKey){
        localStorage.setItem("current", projectKey)
    }else{
        projectKey = localStorage.getItem("current")
    }

    include.includeHTML().then(() => {
        setCurrentProjectName()
    })

    loadAllLists(projectKey)

    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})

}

function setCurrentProjectName(){
    let current = localStorage.getItem("current")
    let project = parseJsonToClassInstance(models.Project, localStorage.getItem(current));
    document.getElementById("current-project-title").innerText = project._title;
}

function loadAllLists(projectKey){
    for(let key in localStorage){
        if(key.includes("list")){ //check if item is a list
            let list = parseJsonToClassInstance(models.List, localStorage.getItem(key));
            if(list._parentKey == projectKey){ //check if list if from current project
                createItem(parseJsonToClassInstance(models.List, localStorage.getItem(key)))
            }
        }
    }
}

function getFormData(){
    let title = document.getElementById("title").value;

    document.getElementById("title").value = ""; //clear fields after getting user input
    document.getElementById("myModal").style.display = "none"; //hide form

    var projectKey = localStorage.getItem("current");
    createItem(new models.List("list-"+getCounter(),title, projectKey));
}

function insertItem(item){
    //code for inserting project
    var newProjectId = `${item._key}`;
    var customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    customContainer.setAttribute("class", "col")
    
    include.singleHtmlElementInsert("../html/list-template.html", "main-project-container", customContainer)

    // //fill project card with data
    var doc = document.getElementById(newProjectId)

    doc.getElementsByClassName("list-title")[0].innerText = item._title
    var inputField = doc.getElementsByClassName("list-title")[0].nextElementSibling;
    inputField.addEventListener('keypress', function (ev) {
        var key = ev.which || ev.keyCode;
        const enterKeyCode = 13;
        if (key === enterKeyCode) {
            addNewTaskToList(ev);
        }
    });
}

function createItem(item){
    saveItem(item); //save to local storage
    insertItem(item)//create & insert new card
}

function saveItem(item){
    localStorage.setItem(item._key, JSON.stringify(item))
}

function getCounter(){
    if(localStorage.counter){
        localStorage.counter = Number(localStorage.counter) + 1
    }else{
        localStorage.counter = 1
    }
    return localStorage.counter

}

function parseJsonToClassInstance(classType, json){
    let jasonData = JSON.parse(json)
    let values = [];
    
    for(let key in jasonData){
        values.push(jasonData[key])
    }

    return new classType(...values)
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query.key
}

function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var listId = ev.target.parentNode.id;
  var divChilds = document.getElementById(listId).childNodes;
  var ul;
  for(var i=0; i < divChilds.length; i++) {
      if(divChilds[i].nodeName == "UL") {
          ul = divChilds[i];
      }
  }
  var li = document.createElement("li");
  setLiAttributes(li, listId);
  li.appendChild(document.createTextNode(taskTitle));
  ul.appendChild(li);
  ev.target.value = '';
  addRemoveListeners();
  tasksIdCounter++;
}

function setLiAttributes(li, listId) {
  li.setAttribute("class", "task");
  li.setAttribute("id", "task" + listId + tasksIdCounter);
  li.setAttribute("draggable", "true");
  li.setAttribute("ondragstart", "drag(event)");
  li.insertAdjacentHTML('beforeend', '<span><i class="fa fa-trash"></i></span>');
}

function removeTask(ev) {
    ev.currentTarget.parentNode.parentNode.removeChild(ev.currentTarget.parentNode);
}

function addRemoveListeners() {
    var spans = document.getElementsByTagName('span');
    for(var i=0;i<spans.length;i++) {
	spans[i].onclick = removeTask;
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

addKeyListenersToInputs();
addRemoveListeners();