const API_KEY = "AIzaSyBIfnNWrxwk8ToYmORiulb4NgrSMDe6oHQ";
const YELP_API_KEY = "PmWrsc_YHcUU25HOL7Sa0GL_ME8Pn9d1681ntdnNGh_IAzYD4xDJQ3rxYyZDbT2IxrprhsYrr7eCHVXsURFZVyOS8flp6tOpDazuHoibMMncOepWS3gnxZFsQkUIYXYx";
const SIZE = 0;
const PRICE = 1;
const COMPANY = 0;
const TOTAL = 1;
const LOCATION = 2;

var messages;
var emailStructures;
var count = 0;
let user_signed_in = false;



// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
  }); 
   
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_access_token') {
        chrome.identity.getAuthToken( { interactive: true }, function (auth_token) {
            console.log(auth_token);
         });
        sendResponse(true);
    } else if (request.message === 'score_pyk'){
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
              let fetch_options = { headers: {'Authorization': `Bearer ${token}`}};
            scorePYK(fetch_options);     
        });        
         
    } else if (request.message === 'kg'){
            chrome.identity.getAuthToken({ interactive: true }, function (token) {
                let fetch_options = { headers: {'Authorization': `Bearer ${token}`}};
                getKG(fetch_options);     
        });

    } else if (request.message === 'get_receipts'){
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            let fetch_options = { headers: {'Authorization': `Bearer ${token}`}};
            getReceipts(fetch_options);     
    });


    } else if (request.message === 'get_pyk'){
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            let fetch_options = { headers: {'Authorization': `Bearer ${token}`}};
            getPYK(fetch_options);
        });
    }   else if (request.message === 'get_contacts') {
          chrome.identity.getAuthToken({ interactive: true }, function (token) {
                     let fetch_url = `https://people.googleapis.com/v1/contactGroups/all?maxMembers=20&key=${API_KEY}`;
                     let fetch_options = {
                         headers: {
                             'Authorization': `Bearer ${token}`
                         }
                     }
            fetch(fetch_url, fetch_options)
                .then(res => res.json())
                .then(res => console.log(res));
         });
    }   else if (request.message === 'get_emails') {

          fetch('emailstructures.json')
            .then(response => response.json())
            .then(response => {
            emailStructures = response;

            let view = chrome.extension.getViews({ type: "popup"})[0];
            let domOrders = view.document.getElementById('orders');
            
            // remove all orders, do not remove header row
            let trs = domOrders.getElementsByTagName('tr');
            let nOrders = trs.length;
            if (nOrders > 1)
            {
                for (let k=0; k<(nOrders-1); k++)
                {
                     trs.item(1).remove();
                }
            }
            
            
          for (let i=0;i<emailStructures.companies.length;i++)
          {
          chrome.identity.getAuthToken({ interactive: true }, function (token) {
                //let fetch_url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=in:sent after:2021/01/01&key=${API_KEY}`;
                let fetch_url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:(${emailStructures.companies[i].from}) subject:(${emailStructures.companies[i].subject})&key=${API_KEY}`;
                let fetch_options = {
                headers: {
                 'Authorization': `Bearer ${token}`
                }
            }

            fetch(fetch_url, fetch_options)
                .then(res => res.json())
                .then(res => {
                    if (res.messages)
                    {

                        const messages = res.messages;
                        for (let j=0; j < messages.length; j++)
                        {
                            
                            fetch_url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + messages[j].id + '?key=${API_KEY}';
                            fetch(fetch_url, fetch_options)
                                .then(res => res.json())
                                .then(res => {
                                let sBody = getBody(res);
                                let sDate = getEmailDate(res);
                                let hncItems = getItems(emailStructures.companies[i], sBody, sDate);
                                
                                for (let l=0;l<hncItems.length;l++)
                                {
                                    let row = view.document.createElement('tr');
                                    let tdCompany = view.document.createElement('td');
                                    let tdDate = view.document.createElement('td');
                                    let tdSize = view.document.createElement('td');
                                    let tdPrice = view.document.createElement('td');
                                    let tdItem = view.document.createElement('td');
                                    row.appendChild(tdCompany);
                                    row.appendChild(tdDate);
                                    row.appendChild(tdItem);
                                    row.appendChild(tdSize);
                                    row.appendChild(tdPrice);
                                    tdCompany.innerText = emailStructures.companies[i].name;
                                    tdDate.innerText = sDate;
                                    
                                    if (emailStructures.companies[i].itemFindBy != null)
                                    {
                                        switch (emailStructures.companies[i].itemFindBy)
                                        {
                                            case "parent":
                                                tdItem.innerText = hncItems.item(l).parentElement.innerText;
                                                break;
                                            case "sibling":
                                                tdItem.innerText = hncItems.item(l).parentElement.childNodes[emailStructures.companies[i].itemPosition].innerText.trim();
                                                break;
                                        }
                                    }
                                    else
                                    {
                                        tdItem.innerText = hncItems.item(l).innerText;
                                    }

                                    if (emailStructures.companies[i].itemRemove != undefined)
                                    {
                                        for (let m=0; m<emailStructures.companies[i].itemRemove.length;m++)
                                        {
                                            tdItem.innerText = tdItem.innerText.replace(emailStructures.companies[i].itemRemove[m].text, "");
                                        }
                                    }
                            
                                    if (emailStructures.companies[i].itemSplitBy != undefined)
                                    {
                                        if (emailStructures.companies[i].itemSplitPosition == "first")
                                        {
                                            tdItem.innerText = tdItem.innerText.split(emailStructures.companies[i].itemSplitBy)[0];
                                        }
                                    }

                                    tdSize.innerText = getSize(hncItems.item(l), emailStructures.companies[i],sDate);
                                    tdPrice.innerText = getPrice(hncItems.item(l), emailStructures.companies[i],sDate);

                                    domOrders.appendChild(row);
                                    let sPrice = tdPrice.innerText;
                                    let dtDate = new Date(tdDate.innerText);
                                    let sTo = getEmailTo(res);
                                    let mySQLDate = dtDate.getFullYear() + "-" + (dtDate.getMonth()+1) + "-" + dtDate.getDate();
                                    sPrice = sPrice.replace("$","").trim();
                                    var postData = { "user": `${sTo}`, "date": `${mySQLDate}`, "company": `${tdCompany.innerText}`, "item": `${tdItem.innerText}`, "size": `${tdSize.innerText}`, "price": `${sPrice}` };
                                    console.log(JSON.stringify(postData));
                                    
                                    fetch('http://localhost:8080/api/create.php', {
                                        method: 'POST', // or 'PUT'
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
                                

                               });
                        }
                      
                    }

                })

         });
      
        }
         });
         
     }
});

function getEmailDate(data)
{

    for (var i=0; i<data.payload.headers.length; i++)
    {
        if (data.payload.headers[i].name == 'Date')
        {
            return new Date(data.payload.headers[i].value);
        }
    }
}

function getEmailTo(data)
{
    for (var i=0; i<data.payload.headers.length; i++)
    {
        if (data.payload.headers[i].name == 'To')
        {
            let s = data.payload.headers[i].value;
            s = s.replace("<","");
            s = s.replace(">",""); 
            return s;
        }
    }
}

function getItems(c, html, sDate)
{
    
    let hncItems = null;

    let sItemQuery;
    let sItemNodeNames;
    if (c.itemQueryList)
    {
        let dtDate = new Date(sDate);
        for (let i=0; i<c.itemQueryList.length; i++)
        {
            let dtBefore = new Date(c.itemQueryList[i].dateBefore);
            let dtAfter  = new Date(c.itemQueryList[i].dateAfter);
            if (dtDate.getTime() < dtBefore.getTime() && dtDate.getTime() >= dtAfter.getTime())
                 {
                     sItemQuery = c.itemQueryList[i].itemQuery;
                     sItemNodeNames = c.itemQueryList[i].itemNodeNames;
                 }
        }   
    }

    // Get item nodes
    switch (c.itemHTMLIdentifier)
    {
        case "query":
            let arrNodeNames = sItemNodeNames.split(",");
            arrNodeNames.forEach(sNodeName => 
            {
                hncItems = html.querySelectorAll(sNodeName + sItemQuery);
                if (hncItems.length != 0)
                {
                    return hncItems;
                }
            });
            break;
        case "node":
            hncItems = html.getElementsByTagName(c.itemHTMLName);
            
            if (c.itemRemoveNodeAt != null)
            {
                hncItems.item(c.itemRemoveNodeAt).remove();
            }
            break;

        case "attribute":
            hncItems = html.querySelectorAll('[' + c.itemHTMLName + '="' + c.itemHTMLValue + '"]');
            break;
    }
    return hncItems;
   
}

function getSize(node, c, sDate)
{
    let sSize = "";
    switch (c.sizeFindBy)
    {
        case "text":
            sSize = node.parentElement.parentElement.childNodes[c.sizePosition].nodeValue;
            break;
        case "sibling":
            sSize = node.parentElement.childNodes[c.sizePosition].innerText;
            break;
        case "map":
            let sizeNode;
            sizeNode = findNode(c.sizeMaps, node, SIZE, sDate);
            try 
            {
               sSize = sizeNode.innerText;
            }
            catch (e)
            {
                console.log(sDate + " " + e);
            }
            break;
        case "sameAsItem":
            sSize = node.innerText;
            break;
    }

    if (c.sizeSplitBy != null)
    {
        switch (c.sizeSplitPosition)
        {
            case "last":
                sSize = sSize.split(c.sizeSplitBy)[(sSize.split(c.sizeSplitBy).length-1)];
                break;
        }

        if (c.sizeSplitBy2 != null)
        {
            let sTemp = "";
            for (let i=0; i<c.sizeSplitPosition2.split(",").length;i++)
            {
                sTemp += sSize.split(c.sizeSplitBy2)[c.sizeSplitPosition2.split(",")[i]] + " ";
            }
            sSize = sTemp;
        }
    }
    try{
        sSize = sSize.trim();
    } catch (e) {
        console.log("SIZE: " + sDate + " " + node);
    }
    return sSize.trim();
}

function findNode(maps, node, type, sDate)
{
    let dtDate = new Date(sDate);
    for (let i=0; i<maps.length;i++)
    {
        let dtBefore = new Date(maps[i].dateBefore);
        let dtAfter  = new Date(maps[i].dateAfter);
        
        if (dtDate.getTime() < dtBefore.getTime() && dtDate.getTime() > dtAfter.getTime())
        {
 
            let tmpNode = node; 
            try
            {
                let nParent = maps[i].parent;
                for (let j=0;j<nParent;j++)
                {
                    tmpNode = tmpNode.parentElement;
                }
                let nSibling = maps[i].sibling;
                for (let j=0;j<nSibling;j++)
                {
                    tmpNode = tmpNode.nextElementSibling;
                }
                if (maps[i].child)
                {
                    tmpNode = tmpNode.childNodes.item(maps[i].child);
                }
                if (tmpNode != null && ((type == SIZE && tmpNode.innerText.indexOf('$') == -1) || type == PRICE && tmpNode.innerText.indexOf('$') != -1))
                {
                    return tmpNode;
                }
            } catch (e)
            {
            // ok error
            }
        }

    }

}



function getPrice(node, c, sDate)
{
    let sPrice = "";
    switch (c.priceFindBy)
    {
        case "parent2":
            sPrice = node.parentElement.parentElement.childNodes[c.pricePosition].innerText;
            break;
        case "map":
            let priceNode;
            priceNode = findNode(c.priceMaps, node, PRICE, sDate);
            try{
              sPrice = priceNode.innerText.trim();
            }
            catch (e)
            {
                console.log(sDate + " e");
            }
            break;
        case "parent3":
            sPrice = node.parentElement.parentElement.parentElement.childNodes[c.pricePosition].innerText;
            break;
        case "sibling":
            sPrice = node.parentElement.childNodes[c.pricePosition].innerText.trim();
            break;
    }   
    if (c.priceSplitBy != null)
    {
        sPrice = sPrice.split(c.priceSplitBy)[c.priceSplitPosition];
    }
    try{
        sPrice = sPrice.trim();
    } catch (e)
    {
        console.log("PRICE DATE: " + sDate +" : " + node);
    }
    return sPrice.trim();
}

function getBody(res)
{
    let parser = new DOMParser;
    var sBody = "";
    if (res.payload.parts && res.payload.parts.length > 0)
    {
        for (var i=0; i<res.payload.parts.length; i++)
        {
            if (res.payload.parts[i].mimeType == "text/html")
            {  
                sBody = atob(res.payload.parts[i].body.data.replace(/-/g, '+').replace(/_/g, '/'));
                break;
            }
        }
    }
    else
    {
        sBody = atob(res.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    }

    return parser.parseFromString(sBody, 'text/html');
}

function getSentEmails(user, fetch_options) {
    
    const awaitJson = (responses) => Promise.all(responses.map(response => {
        if(response.ok) return response.json();
        throw new Error(response.statusText);
      }));
   
    let fetch_url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${user}&key=${API_KEY}`;
    let arr = [];
    arr = fetch(fetch_url, fetch_options)
        .then(res => res.json())
        .then(data => {
        
        let responses = [];
        for (let i=0; i < data.messages.length; i++)
        {
            
            fetch_url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${data.messages[i].id}?key=${API_KEY}`;
            let response = fetch(fetch_url, fetch_options);
            responses.push(response);
        }
        return Promise.all(responses);
    })
    .then(awaitJson)
    .then(data => {
        let arrTos = [];
           
        for (let i=0; i < data.length; i++)
        {
            let sEmail = getEmailTo(data[i]);
            if (sEmail != null)
            {   
                let re = /\".*?[a-zA-Z],\s[a-zA-Z].*?\"/g;
                let arrTemp = [];
                let sTempName;
                let arr = sEmail.match(re);
                while(arr!= null)
                {
                    arrTemp = arr[0].split(",");
                    sTempName = arrTemp[1].trim() + " " + arrTemp[0].trim();
                    sTempName = sTempName.split('"').join("");
                    sEmail = sEmail.replaceAll(re, sTempName);
                    arr = sEmail.match(re);
                }

                let arrEmails = sEmail.split(",");
                for (let k=0;k<arrEmails.length;k++) 
                {
                    if (sEmail.match(re))
                    {

                    }
                    let arrEmail = arrEmails[k].split(" ");
                    let sName = "";
                    if (arrEmail.length > 1)
                    {
                        sEmail = arrEmail[arrEmail.length-1]; 
                        arrEmail.pop()
                        sName = arrEmail.join(" ");
                        sEmail = sEmail.split("<").join("").split(">").join("").trim();
                        sName = sName.split('"').join("").trim();
                    }
                    arrTos.push([sName, sEmail]);
                }
            }
        }
        return arrTos;
    })
    .then(data => {
        return data;
    });
    return arr;
}

async function parseGMAIL(fetch_options, obj) {
    let message = await getMessage(fetch_options, obj.id);                       
    // need to change Myerson, Neal to Neal Myerson
    let sEmail = await getEmailTo(message);
    return sEmail;
}
async function getMessages(fetch_options, query) {
    let fetch_url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${query}&key=${API_KEY}`;
    let res =  await fetch(fetch_url, fetch_options)
    return res.json(); 
   }

async function getMessage(fetch_options, id) {

    fetch_url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?key=${API_KEY}`;
    let res =  await fetch(fetch_url, fetch_options)
    return res;         
}

async function getScores(fetch_options, messages, obj) {
    let nScore = 0;
    for (let i=0; i < messages.length; i++)
    {      
        let message = await getMessage(fetch_options, messages[i].id);      
        let dtDate = getEmailDate(message);
        let dtNow = new Date();

        if (dtNow.getFullYear() - dtDate.getFullYear() > 1)
        {
            nScore++;
        }
        else
        {
            nScore += (13-(dtNow.getMonth() - dtDate.getMonth()));
        }
        
    }
    arrPYK.push([obj.id, obj.email,nScore]);                           
}

async function getCalculatedScores(fetch_options, arr, user) {
    
    
    let nScore = 0;
    for (let i=0;i<arr.length;i++)
    {
        if (arr[i][1] == user.email.toLowerCase())
        {
            user.id = arr[i][0];
        }
        let fetch_url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=to:(${arr[i][1]}) OR from:(${arr[i][1]})&key=${API_KEY}`;
        let res =  await fetch(fetch_url, fetch_options);
        let data =  await res.json();
        if (data != null && data.messages != undefined)
        {
            let responses = [];
            for (let j=0; j<data.messages.length; j++)
            {
                fetch_url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${data.messages[j].id}?key=${API_KEY}`;
                let response = fetch(fetch_url, fetch_options);
                responses.push(response);             
            }
            let results = await Promise.all(responses);
            let arrData = await Promise.all(results.map(result => result.json()));
            
            for (let j=0; j<arrData.length;j++)
            {
                nScore = getScore(arrData, user);
            }
            arr[i][2] = nScore;
            console.log(arr[i][1] + ": " + arr[i][2])
        }
    }    
    return arr;
}

function getScore(arr, user) {
    let nScore =  0;
    let dtNow = new Date();
    for (let i=0; i<arr.length;i++)
    {
        if (arr[i].payload != null) {
            dtDate = getEmailDate(arr[i]);
        }
        else {
            // too many queries to gmail
            return nScore;
        }
        if (dtNow.getFullYear() - dtDate.getFullYear() > 1)
        {
            nScore++;
        }
        else
        {
            let sTo = getEmailTo(arr[i]);
            if (sTo == null || sTo.indexOf(user) != -1)
            {
                nScore +=((13-(dtNow.getMonth() - dtDate.getMonth())) / 4);
            }
            else
            {
                nScore += (13-(dtNow.getMonth() - dtDate.getMonth()));
            }
        } 
    }   
    return nScore;                        
}
 
async function getNamesFromDB(user)
{     
    let res = await fetch('http://localhost:8080/api/readUsers.php', {
        method: 'GET' });
    let data = await res.json();
    const arr = []
    data.body.forEach(obj => {
    
    let fFound = false;
    if (arr.length != 0)
    {
        for (let i=0;i<arr.length;i++)
        {
            if (arr[i][1] == obj.email)
            {
                fFound = true;
                break;
            }
        }
    }
    if (!fFound && user.email != obj.email.toLowerCase())
    {
        arr.push([obj.id, obj.email,0]); 
    }
    else
    {
        if (user.email != obj.email.toLowerCase())
        {
            user.id = obj.id;
        }
    }
    })
    return arr;     
}

async function getUser(fetch_options)
{
    let fetch_url = `https://www.googleapis.com/oauth2/v1/userinfo?key=${API_KEY}`;
    let res =  await fetch(fetch_url, fetch_options);
    let data = await res.json();  
    return data.email;
}

function sortByColumn(arr, colIndex){
    arr.sort(sortFunction);
    function sortFunction(a, b) {
        a = a[colIndex]
        b = b[colIndex]
        return (a === b) ? 0 : (a > b) ? -1 : 1
    }
}


async function getPYK(fetch_options)
{
    const user = await getUser(fetch_options);
    
    getSentEmails(user, fetch_options)
        .then (arr => {

    
        let view = chrome.extension.getViews({ type: "popup"})[0];
        let domPYK = view.document.getElementById('pyk');
        
        
        for (let i=0; i< arr.length; i++)
        {
            let row = view.document.createElement('tr');
            let tdName = view.document.createElement('td');
            let tdEmail = view.document.createElement('td');
            tdName.innerText = arr[i][0];
            tdEmail.innerText = arr[i][1];
            row.appendChild(tdName);
            row.appendChild(tdEmail);
            domPYK.appendChild(row);
     
            var postData = { "name": `${arr[i][0]}`, "email": `${arr[i][1]}`, "active": "0" };
            fetch('http://localhost:8080/api/createUser.php', {
                method: 'POST', // or 'PUT'
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
    });
}
        
async function getReceiptMap() {

    let map = await fetch('receipts.json');
    return map.json();
}

function getNodeText(html, TYPE, map) { 
    let node = null;
    switch (TYPE) {
        case COMPANY:
            node = html.querySelectorAll(`${map.find_company_by_query}`)[map.find_company_by_item];
            break;
        case TOTAL:
            node = html.querySelectorAll(`${map.find_receipt_total_by_query}`)[map.find_receipt_total_by_item];
            break;
        case LOCATION:
            node = html.querySelectorAll(`${map.find_receipt_location_by_query}`)[map.find_receipt_location_by_item];
            break;
        }
    if (node != null) {
        return node.innerText;
    }
    else {
        return null;
    }
}

function convertDate(date)
{
    let dt = new Date(date);
    return (dt.getFullYear() + "-" + (dt.getMonth()+1) + "-" + dt.getDate());
}
async function getReceipts(fetch_options) {

    const user = {id:'', email: ''};
    user.email = await getUser(fetch_options);
    arr = [];
    
    let map = await getReceiptMap();
    for (let i=0; i<map.receipts.length; i++)
    {
        let responses = [];
        let resMessages = await getMessages(fetch_options, map.receipts[i].query);
        for (let i=0; i<resMessages.messages.length; i++) {
            response = getMessage(fetch_options, resMessages.messages[i].id);
            responses.push(response);             
        }
            
        let results = await Promise.all(responses);
        let arrData = await Promise.all(results.map(result => result.json()));
        for (let j=0; j<arrData.length; j++)
        {
            let html = getBody(arrData[j]);
            let sCompany = getNodeText(html, COMPANY, map.receipts[i]);
            if (sCompany == null)
            {
                console.log(sCompany);
            }
            let sDate = getEmailDate(arrData[j]);
            let sReceiptTotal = getNodeText(html, TOTAL, map.receipts[i]);
            if (sReceiptTotal != null) {
                sReceiptTotal = sReceiptTotal.replace("$","");            }

            let sReceiptLocation = getNodeText(html, LOCATION, map.receipts[i]);
            if (sReceiptLocation == null) {
                sReceiptLocation = "Seattle";
            }
            arr.push([sDate, sCompany, sReceiptTotal, sReceiptLocation]);
        }         
    }

    arr.forEach(obj => {
        if (obj[1] != null) {
            console.log(obj[1] + " " + obj[2] + " " + obj[3]);
            let mySQLDate = convertDate(obj[0]);

            var postData = { "useremail": `${user.email}`, "date": `${mySQLDate}`, "name": `${obj[1]}`, "total": `${obj[2]}` , "city" : `${obj[3]}` };
            fetch('http://localhost:8080/api/createReceipt.php', {
                method: 'POST', // or 'PUT'
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
    })
 }



async function scorePYK(fetch_options)
{
    const awaitJson = (responses) => Promise.all(responses.map(response => {
        if(response.ok) return response.json();
        throw new Error(response.statusText);
      }));
    
    const user = {id:'', email:''};
    user.email = await getUser(fetch_options);
    let arrPYK = await getNamesFromDB(user);   
    arrPYK = await getCalculatedScores(fetch_options, arrPYK, user);   
    sortByColumn(arrPYK, 2);
    
    let arrErrors = [];
        
    let view = chrome.extension.getViews({ type: "popup"})[0];
    let domPYK = view.document.getElementById('pyk');
    for (let i=0;i<arrPYK.length;i++)
    {
        let row = view.document.createElement('tr');
        let tdId = view.document.createElement('td');
        let tdEmail = view.document.createElement('td');
        let tdScore = view.document.createElement('td');
        row.appendChild(tdId);
        row.appendChild(tdEmail);
        row.appendChild(tdScore);
        tdId.innerText = arrPYK[i][0];
        tdEmail.innerText = arrPYK[i][1];
        tdScore.innerText = arrPYK[i][2];
        domPYK.appendChild(row);

        if (arrPYK[i][2] == 0)
        {
            arrErrors.push(arrPYK[i]);
        }

        var postData = { "userid": `${user.id}`, "pykid": `${arrPYK[i][0]}`, "score": `${arrPYK[i][2]}` };
        fetch('http://localhost:8080/api/createPYK.php', {
            method: 'POST', // or 'PUT'
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

   //too many GMAIL API calls lead to errors. 
   //console.log(arrErrors.length);
    
}
 
async function getKG(fetch_options)
{
    let fetch_url = 'https://api.yelp.com/v3/businesses/search?location=seattle&term=Wedgwood Dental Center';
    let fetch_yelp_fetch_options = { headers: {Authorization: `Bearer ${YELP_API_KEY}`}};
    let res = await fetch(fetch_url, fetch_yelp_fetch_options);     
    let data = await res.json();
    console.log(data);
}