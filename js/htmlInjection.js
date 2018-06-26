export function includeHTML() {
  return new Promise((resolve, reject) => {
    var z, i, elmnt, file, xhttp, filepath;
    filepath = "data-filepath";
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute(filepath);
      if (file) {
        /*make an HTTP request using the attribute value as the file name:*/
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /*remove the attribute, and call this function once more:*/
            elmnt.removeAttribute(filepath);
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /*exit the function:*/
        break;
      }
    }
    resolve() //if function finished, cast, that there was no error and .then can be executed
  })
}

export  function singleHtmlElementInsert(filepath, customContainer, destinationContainerId) {
  return new Promise((resolve, reject) => {

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if ((xhttp.readyState == 4) && (xhttp.status == 200)) {
          customContainer.innerHTML = xhttp.responseText;
          if(destinationContainerId){
            document.getElementById(destinationContainerId).appendChild(customContainer);
          }
          resolve();
        }
      }
      xhttp.open("GET", filepath, true);
      xhttp.send();
    })
      
  }
    
