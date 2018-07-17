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

export function getCounter(){
    if(localStorage.counter){
        localStorage.counter = Number(localStorage.counter) + 1
    }else{
        localStorage.counter = 1
    }
    return localStorage.counter
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

export function parseJsonToClassInstance(classType, json){
    let jasonData = JSON.parse(json)
    let values = [];
    
    for(let key in jasonData){
        values.push(jasonData[key])
    }

    return new classType(...values)
}

export function createItem(item, insertItem){
    fetch(`${localBackend}/users/${item.author.id}/projects`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(item)
    })
    .then((resp) => { 
        return resp.json()
    })
    .then((data) => {
        let newProject = new models.Project(data.id, item.title, item.description, item.author.id);
        insertItem(newProject);
    }).catch((err) => {
        console.log('err :', err);
    })
}

export function createList(item, insertItem){
    fetch(`${localBackend}/projects/${item.parentProject.id}/lists`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(item)
    })
    .then((resp) => { 
        return resp.json()
    })
    .then((data) => {
        let newProject = new models.List(data.id, item.title, item.parentProject.id);
        insertItem(newProject);
    }).catch((err) => {
        console.log('err :', err);
    })
}

export function createTask(item, insertItem){
    fetch(`${localBackend}/lists/${item.parentList.id}/tasks`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(item)
    })
    .then((resp) => { 
        return resp.json()
    })
    .then((data) => {
        let newProject = new models.Task(data.id, item.title, item.parentList.id);
        console.log('newProject :', newProject);
        insertItem(newProject);
    }).catch((err) => {
        console.log('err :', err);
    })
}

export function removeItem(event, removeResource) {
    if(confirm('Remove?')) {
        removeResource(event);
    }

}

export function silentRemove(event){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${localBackend}/projects/${identifier}`,{
        method: "DELETE"
    })
    .then(() => {
        document.getElementById(identifier).remove();
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function removeTask(event){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${localBackend}/tasks/${identifier}`,{
        method: "DELETE"
    })
    .then(() => {
        document.getElementById(identifier).remove();
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function removeList(event){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${localBackend}/lists/${identifier}`,{
        method: "DELETE"
    })
    .then(() => {
        document.getElementById(identifier).remove();
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function saveItem(item){
    localStorage.setItem(item._key, JSON.stringify(item))
}

export function onKeyPress(event, callback){
    let key = event.which || event.keyCode;
    const enterKeyCode = 13;
    if (key === enterKeyCode) {
        callback()
    }
}