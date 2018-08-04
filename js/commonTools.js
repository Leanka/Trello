import * as include from "./htmlInjection.js";
import * as models from "./models.js"
import * as dbUser from "../db/users.js"

   var backend = "https://safe-crag-70832.herokuapp.com";
// var backend = "https://trello-like-app-f4tall.c9users.io";

export function loadAllComponents(components){
    let allPromises = [];
    components.forEach((component) => {
        let filename = component.getAttribute("data-filepath");
        allPromises.push(include.singleHtmlElementInsert(filename, component))
    })
    return Promise.all(allPromises);
}

export function loadProjectTitle(projectId, insertItem, accessToken){
    fetch(`${backend}/projects/${projectId}`, {
        headers: {'authorization': accessToken}
    })
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

export function getAllUsers(accessToken) {
    let users = [];
    fetch(`${backend}/users`, {
        headers: {'authorization': accessToken}
    })
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

export function loadAllProjects(localUserId, insertItem, accessToken){
    fetch(`${backend}/users/${localUserId}/projects`, {
        headers: {'authorization': accessToken}
    })
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

export function loadAllLists(projectId, insertList, insertTasks, accessToken){
    fetch(`${backend}/projects/${projectId}/lists`, {
        headers: {'authorization': accessToken}
    })
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
            insertList(current).then(()=>loadAllTasks(current._key, insertTasks, accessToken))
        }
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

function loadAllTasks(listId, insertItem, accessToken){
    fetch(`${backend}/lists/${listId}/tasks`, {
        headers: {'authorization': accessToken}
    })
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

export function createProject(item, insertItem, accessToken){
    createResource(item, insertItem, "users", "projects", accessToken);
}

export function createList(item, insertItem, accessToken){
    createResource(item, insertItem, "projects", "lists", accessToken);
}

export function createTask(item, insertItem, accessToken){
    createResource(item, insertItem, "lists", "tasks", accessToken);
}

export function createUser(newUser, accessToken) {
    fetch(`${backend}/users/`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(newUser)
    })
}

function createResource(item, insertItem, parentType, childType, accessToken){
    fetch(`${backend}/${parentType}/${item.parentKey.id}/${childType}`,{
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8",
                   "authorization": accessToken
        },
        body: JSON.stringify(item)
    }).then((resp) => {
        return resp.json()
    }).then((data) => {
        insertNewResource(item, data._id, childType, insertItem);
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

export function updateResource(id, resourceType, dataToUpdate, accessToken){
    fetch(`${backend}/${resourceType}/${id}`,{
        method: "PATCH",
        headers: {"Content-Type": "application/json; charset=utf-8",
                  "authorization": accessToken
        },
        body: JSON.stringify(dataToUpdate)
    })
    .catch((err) => {
        console.log('err :', err);
    })
}

export function removeItem(event, removeResource, accessToken) {
    if(confirm('Remove?')) {
        removeResource(event, accessToken);
    }
}

export function removeTask(event, accessToken, updateTergetListOrder){
    removeResource(event, "tasks", accessToken, updateTergetListOrder);
}

export function removeList(event, accessToken){
    removeResource(event, "lists", accessToken);
}

export function removeProject(event, accessToken){
    removeResource(event, "projects", accessToken);
}

function removeResource(event, resourceType, accessToken, next){
    let identifier = event.target.getAttribute("identifier");
    fetch(`${backend}/${resourceType}/${identifier}`,{
        method: "DELETE",
        headers: { "authorization": accessToken },
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

export function cookieSearch(key) {
  let cookie = document.cookie,
    result;

  if (cookie.includes(`${key}=`)) {
    result = `${cookie.split(`${key}=`)[1].split(`;`)[0]}`;
  } else {
    result = `Key not found in cookie.`;
  }
  return result;
}
