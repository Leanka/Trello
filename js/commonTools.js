import * as include from "../js/htmlInjection.js";

export function loadAllComponents(components){
    let allPromises = [];
    components.forEach((component) => {
        let filename = component.getAttribute("data-filepath");
        allPromises.push(include.singleHtmlElementInsert(filename, component))
    })
    return Promise.all(allPromises);
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
    saveItem(item); //save to local storage
    insertItem(item)//create & insert new card
}

export function removeItem(event, hasNestedResources) {
    let identifier = event.target.getAttribute("identifier")
    
    if(confirm('Remove?')) {
      silentRemove(event);
      if(hasNestedResources){
        removeNestedResources(identifier)
        }
    }
}

function removeNestedResources(itemKey) {
    for(let key in localStorage){
        if(key.includes("list-") || key.includes("task-")){
            let item = JSON.parse(localStorage.getItem(key))
            if(item && (item._parentKey == itemKey)){
                localStorage.removeItem(key);
                removeNestedResources(item._key);

            }
        }
    }
}

export function silentRemove(event){
    let identifier = event.target.getAttribute("identifier");
    localStorage.removeItem(identifier);
    document.getElementById(identifier).remove()
}

export function saveItem(item){
    localStorage.setItem(item._key, JSON.stringify(item))
}