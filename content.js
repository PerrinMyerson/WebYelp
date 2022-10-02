// content.js
async function load_modaldialog() {
  let el = new DOMParser().parseFromString('<div id="wn_overlay" class="wn_overlay"></div>', 'text/html').body.childNodes[0];
  let url = chrome.runtime.getURL("modaldialog.html");

  document.querySelector("body").appendChild(el);
  document.getElementById("wn_overlay").innerHTML = (await fetch(url)).text();
}

async function getHighlightsFromDB() {
  let fetch_url = `http://localhost:8080/php/api/getHighlights.php?url=${window.location.href}`;
  let res = await fetch(fetch_url, {
        method: 'GET' });
  let data = await res.json();
  const arr = [];
  data.highlights.forEach(obj => {
    arr.push(obj);        
  });

  let sel = null;
  for (let i=0; i<arr.length; i++) {
    sel = getPreviousSelection(arr[i]);
    highlight(sel);
  }
}

load_modaldialog();
getHighlightsFromDB();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      let sel = window.getSelection();
      if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
        sel.removeAllRanges();
        sel.addRange(range);
        saveHighlight(sel);
        highlight(sel);
      }
    }
  }
  );

document.addEventListener( "click", someListener );



function someListener(event){
    var element = event.target;
    if(element.classList.contains("wn_") || element.classList.contains("wn_closebutton") ){
        toggleOverlay(element);
    }
}

function toggleOverlay(el) {
  //el.style.display = "block";
  var e =document.getElementsByClassName("wn_overlay");
  if (e[0].style.display == 'block')  {
    e[0].style.display = 'none';
  } else {
      e[0].style.display = 'block';
      var rect = el.getBoundingClientRect();
      e[0].style.top = rect.top + 'px';
      e[0].style.left = (rect.right + 10) + 'px';
  }      
}

function saveHighlight(sel) {
  
  let range = sel.getRangeAt(0);
  let startNode = range.startContainer;
  let endNode = range.endContainer;
  
  if (startNode.nodeType == 3) {
    var startIsText = true;
    var startFlag = startNode.parentNode;
    startNode = startNode.nodeValue;
  } else {
    var startIsText = false;
    var startFlag = startNode;
  }
  if (endNode.nodeType == 3) {
    var endIsText = true;
    var endFlag = endNode.parentNode;
    endNode = endNode.nodeValue;
   } else {
    var endIsText = false;
    var endFlag = endNode;
  }

  let startOffset = range.startOffset; 
  let endOffset = range.endOffset; 

  let startTagName = startFlag.nodeName;
  let startHTML = startFlag.innerHTML;

  let endTagName = endFlag.nodeName;
  let endHTML = endFlag.innerHTML;
  let dt = new Date();
  let sDate = dt.getFullYear() + "-" + (dt.getMonth()+1) + "-" + dt.getDay();
  // do save here
  var postData = { "email" : "nmyerson@gmail.com",
                   "url" : `${window.location.href}`,
                   "date" : `${sDate}`,
                   "startNode": `${startNode}`,
                   "startOffset": `${startOffset}`, 
                   "startIsText": `${startIsText}`,
                   "startTagName": `${startTagName}`,
                   "startHTML": `${startHTML}`,
                   "endNode": `${endNode}`,
                   "endOffset": `${endOffset}`, 
                   "endIsText": `${endIsText}`, 
                   "endTagName": `${endTagName}`,
                   "endHTML": `${endHTML}`
                  };

  fetch('http://localhost:8080/php/api/createHighlight.php', {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
      })
    .then(response => response.json())
    .then(data => {
          console.log('Success:', data);
      })
    .catch((error) => {
        console.error('Error:', error);
      });
}

  


function findEle(tagName, innerHTML) {
  let list = document.getElementsByTagName(tagName);
  for (let i = 0; i < list.length; i++) {
    if (list[i].innerHTML == innerHTML) {
      return list[i];
    }
  }
}

function getPreviousSelection(obj){
  let sP = findEle(obj.startTagName, obj.startHTML);
  let eP = findEle(obj.endTagName, obj.endHTML);
 
  var s, e;
  if (obj.startIsText == 'true') {
    let childs = sP.childNodes;
    console.log(childs);
    for (let i = 0; i < childs.length; i++) {
      console.log(childs[i].nodeValue);
      console.log(obj.startNode);
      if (childs[i].nodeType == 3 && childs[i].nodeValue == obj.startNode)
        s = childs[i];
      console.log(s);
    }
  } else {
    s = obj.startNode;
  }

  if (obj.endIsText == 'true') {
    let childs = eP.childNodes;
    console.log(childs);
    for (let i = 0; i < childs.length; i++) {
      if (childs[i].nodeType == 3 && childs[i].nodeValue == obj.endNode)
        e = childs[i];
      console.log(e);
    }
  } else {
    e = obj.endNode;
  }

  let range = document.createRange();
  range.setStart(s, obj.startOffset);
  range.setEnd(e, obj.endOffset);

  let sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  return sel;
 }

function highlight(sel) {

  document.designMode = "on";
  document.execCommand("insertHTML", false, "<span class='wn_' style='background-color:#ff0000'>"+ document.getSelection()+"</span>");
  document.designMode = "off";
}

function buildRange(startOffset, endOffset, nodeData, nodeHTML, nodeTagName){
  var cDoc = document.getElementById('content-frame').contentDocument;
  var tagList = cDoc.getElementsByTagName(nodeTagName);

  // find the parent element with the same innerHTML
  for (var i = 0; i < tagList.length; i++) {
      if (tagList[i].innerHTML == nodeHTML) {
          var foundEle = tagList[i];
      }
  }

  // find the node within the element by comparing node data
  var nodeList = foundEle.childNodes;
  for (var i = 0; i < nodeList.length; i++) {
      if (nodeList[i].data == nodeData) {
          var foundNode = nodeList[i];
      }
  }

  // create the range
  var range = cDoc.createRange();

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

/*function highlight() {
  getSelectedText();
  var range, sel;
  if (window.getSelection) {
      // IE9 and non-IE
      try {
          if (!document.execCommand("BackColor", false, colour)) {
              makeEditableAndHighlight("#ff0000");
          }
      } catch (ex) {
          makeEditableAndHighlight("#ff0000");
      }
  } else if (document.selection && document.selection.createRange) {
      // IE <= 8 case
      range = document.selection.createRange();
      range.execCommand("BackColor", false, "#ff0000");
  }
}*/
 
 /* by jQuery
 
 function overlay() {
 
     if(!$('.ogroobox').is(':visible')){
         $(".ogroobox").slideDown(1000);
 
     }else{
         $(".ogroobox").fadeOut(500);
     }
 
 }
 
 
  $(".overly").click(function(){
 overlay() ;
 //make a class in html tag aginest onclick 
 }) */
 