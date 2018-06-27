
export  function singleHtmlElementInsert(filepath, customContainer, destinationContainerId) {
  return new Promise((resolve, reject) => {

      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if ((xhttp.readyState == 4) && (xhttp.status == 200)) {
          customContainer.innerHTML = xhttp.responseText;
    
          if(destinationContainerId){
            destinationContainerId.appendChild(customContainer);
            resolve();
          }else{
            resolve();
          }
          // resolve();
        }
      }
      xhttp.open("GET", filepath, true);
      xhttp.send();
    })
      
  }
    
