var tasksIdCounter = 10;

function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var listId = ev.target.nextSibling.nextSibling.id;
  var ul = document.getElementById(listId);
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