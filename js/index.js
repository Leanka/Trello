import * as include from "../js/htmlInjection.js";
import * as models from "../js/models.js";


window.onload = function(){
    loadAllComponents(document.querySelectorAll("[data-filepath]")); //if there would be components from main container, add returning Promis.all
    loadAllProjects();
    
    document.getElementById("close").addEventListener("click", () => {document.getElementById("myModal").style.display = "none"})
    document.getElementById("myModal").addEventListener("click", (event) => {event.target == document.getElementById("myModal")? event.target.style.display = "none":""})
    document.getElementById("modal-submit").addEventListener("click", () => {getFormData()})

}

function loadAllComponents(components){
    let allPromises = [];
    components.forEach((component) => {
        let filename = component.getAttribute("data-filepath");
        allPromises.push(include.singleHtmlElementInsert(filename, component))
    })
    return Promise.all(allPromises);
}

function loadAllProjects(){
    for(let key in localStorage){
        if(key.includes("project")){
            createItem(parseJsonToClassInstance(models.Project, localStorage.getItem(key)))
        }
    }
}

function getCounter(){
    if(localStorage.counter){
        localStorage.counter = Number(localStorage.counter) + 1
    }else{
        localStorage.counter = 1
    }
    return localStorage.counter

}

function getFormData(){
    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;

    document.getElementById("title").value = ""; //clear fields after getting user input
    document.getElementById("description").value = "";
    document.getElementById("myModal").style.display = "none"; //hide form
    createItem(new models.Project("project-"+getCounter(),title, description));
}

function createItem(item){
    saveItem(item); //save to local storage
    insertItem(item)//create & insert new card
}

function saveItem(item){
    localStorage.setItem(item._key, JSON.stringify(item))
}

function insertItem(item){
    //code for inserting project
    var newProjectId = `${item._key}`;
    var customContainer = document.createElement("div");
    customContainer.setAttribute("id", newProjectId)
    
    include.singleHtmlElementInsert("../html/project-card.html", customContainer, "main-project-container").then(() => {
        //fill project card with data
        let doc = document.getElementById(newProjectId);
        console.log('doc :', doc);
        console.log('item._title :', item._title);
        doc.getElementsByClassName("card-title")[0].innerText = item._title
        doc.getElementsByClassName("card-text")[0].innerText = item._description
        console.log('doc :', doc);
        let myTarget = doc.getElementsByTagName("a")[0]
        let loc = myTarget.getAttribute("href")
        myTarget.setAttribute("href", loc + '?key=' + newProjectId); 
    })
}

function parseJsonToClassInstance(classType, json){
    let jasonData = JSON.parse(json)
    let values = [];
    
    for(let key in jasonData){
        values.push(jasonData[key])
    }

    return new classType(...values)
}

