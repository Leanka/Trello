
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
    
