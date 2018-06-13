function addNewTaskToList(ev) {
  var taskTitle = ev.target.value;
  var ul = document.getElementById("todo-list-id");
  var li = document.createElement("li");
  li.insertAdjacentHTML('beforeend', '<span><i class="fa fa-trash"></i></span>');
  li.appendChild(document.createTextNode(taskTitle));
  ul.appendChild(li);
  ev.target.value = '';
}

document.getElementsByName("newTask")[0].addEventListener('keypress', function (ev) {
    var key = ev.which || ev.keyCode;
    const enterKeyCode = 13;
    if (key === enterKeyCode) {
      addNewTaskToList(ev);
    }
});