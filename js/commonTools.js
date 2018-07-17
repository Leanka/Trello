import * as include from "./htmlInjection.js";
import * as models from "./models.js"
var backend = "https://safe-crag-70832.herokuapp.com";
var localBackend = "http://192.168.0.45:8088";

export function loadAllComponents(components){
    let allPromises = [];
    components.forEach((component) => {
        let filename = component.getAttribute("data-filepath");
        allPromises.push(include.singleHtmlElementInsert(filename, component))
    })
    return Promise.all(allPromises);
}

export function loadAllProjects(localUserId, insertItem){
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
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function loadAllLists(projectId, insertList, insertTasks){
    fetch(`${localBackend}/projects/${projectId}/lists`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let list of json){
            let current = new models.List(
                list._id,
                list.title,
                list.parentProject.id
            )
            insertList(current)
            loadAllTasks(current._key, insertTasks)
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

function loadAllTasks(listId, insertItem){
    fetch(`${localBackend}/lists/${listId}/tasks`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let task of json){
            let current = new models.Task(
                task._id,
                task.title,
                task.parentList.id
            )
            insertItem(current);
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function parseQuery(queryString) {
    let query = {};
    let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query.key
}

export function createProject(item, insertItem){
    createResource(item, insertItem, "users", "projects");
}

export function createList(item, insertItem){
    createResource(item, insertItem, "projects", "lists");
}

export function createTask(item, insertItem){
    createResource(item, insertItem, "lists", "tasks");
}

function createResource(item, insertItem, parentType, childType){
    fetch(`${localBackend}/${parentType}/${item.parentList.id}/${childType}`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(item)
    })
    .then((resp) => { 
        return resp.json()
    })
    .then((data) => {
        insertNewResource(item, data.id, childType, insertItem);
    }).catch((err) => {
        console.log('err :', err);
    })
}

function insertNewResource(item, id, resourceType, insertResource){
    switch (resourceType) {
        case "tasks":
            insertResource(new models.Task(id, item.title, item.parentList.id));
            break;
        case "lists":
            insertResource(new models.List(id, item.title, item.parentProject.id));
            break;
        case "projects":
            insertResource(new models.Project(id, item.title, item.description, item.author.id));
            break;
    
        default:
            break;
    }
}

export function removeItem(event, removeResource) {
    if(confirm('Remove?')) {
        removeResource(event);
    }
}

export function removeTask(event){
    removeResource(event, "tasks");
}

export function removeList(event){
    removeResource(event, "lists");
}

export function removeProject(event){
    removeResource(event, "projects");
}

function removeResource(event, resourceType){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${localBackend}/${resourceType}/${identifier}`,{
        method: "DELETE"
    })
    .then(() => {
        document.getElementById(identifier).remove();
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function onKeyPress(event, callback){
    let key = event.which || event.keyCode;
    const enterKeyCode = 13;
    if (key === enterKeyCode) {
        callback()
    }
}
