import * as include from "./htmlInjection.js";
import * as models from "./models.js"
import * as dbUser from "../db/users.js"
var backend = "https://safe-crag-70832.herokuapp.com";

export function loadAllComponents(components){
    let allPromises = [];
    components.forEach((component) => {
        let filename = component.getAttribute("data-filepath");
        allPromises.push(include.singleHtmlElementInsert(filename, component))
    })
    return Promise.all(allPromises);
}

export function loadProjectTitle(projectId, insertItem){
    fetch(`${backend}/projects/${projectId}`)
    .then((resp) => {
        return resp.json()
    })
    .then((project) => {
        insertItem(project.title);
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function getAllUsers() {
    let users = [];
    fetch(`${backend}/users`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let user of json) {
            let current = new models.User(
                user._id,
                user.username,
                user.password
            )
            users.push(current);
        }
    })
    .then(() => {
        dbUser.setUsers(users);
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function loadAllProjects(localUserId, insertItem){
    fetch(`${backend}/users/${localUserId}/projects`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let project of json){
            let current = new models.Project(
                project._id,
                project.title,
                project.description,
                project.parentKey.id
            )
            insertItem(current);
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function loadAllLists(projectId, insertList, insertTasks){
    fetch(`${backend}/projects/${projectId}/lists`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let list of json){
            let current = new models.List(
                list._id,
                list.title,
                list.parentKey.id
            )
            insertList(current).then(()=>loadAllTasks(current._key, insertTasks))
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

function loadAllTasks(listId, insertItem){
    fetch(`${backend}/lists/${listId}/tasks`)
    .then((resp) => {
        return resp.json()
    })
    .then((json) => {
        for(let task of json){
            let current = new models.Task(
                task._id,
                task.title,
                task.status,
                task.parentKey.id
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

export function createUser(newUser) {
    fetch(`${backend}/users/`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(newUser)
    })
}

function createResource(item, insertItem, parentType, childType){
    fetch(`${backend}/${parentType}/${item.parentKey.id}/${childType}`,{
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
            insertResource(new models.Task(id, item.title, item.status, item.parentKey.id));
            break;
        case "lists":
            insertResource(new models.List(id, item.title, item.parentKey.id));
            break;
        case "projects":
            insertResource(new models.Project(id, item.title, item.description, item.parentKey.id));
            break;
    
        default:
            break;
    }
}

export function updateResource(id, resourceType, dataToUpdate){
    fetch(`${backend}/${resourceType}/${id}`,{
        method: "PATCH",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(dataToUpdate)
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function removeItem(event, removeResource) {
    if(confirm('Remove?')) {
        removeResource(event);
    }
}

export function removeTask(event, updateTergetListOrder){
    removeResource(event, "tasks", updateTergetListOrder);
}

export function removeList(event){
    removeResource(event, "lists");
}

export function removeProject(event){
    removeResource(event, "projects");
}

function removeResource(event, resourceType, next){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${backend}/${resourceType}/${identifier}`,{
        method: "DELETE"
    })
    .then(() => {
        document.getElementById(identifier).remove();
        if(next){
            next()
        }
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
