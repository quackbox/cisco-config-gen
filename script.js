
const addVLANButton = document.getElementById("addvlan");
const deleteVLANButton = document.getElementById("deletevlan");
const systemContainer = document.getElementById("System");
const firstVLAN = document.getElementById("vlan1");
const sideBar = document.getElementById("sidebar");
const minimum = 4;
const maximum = 15;

var IPv4Collection = document.getElementsByClassName("ipv4");


var TextCollection = document.getElementsByClassName("text");
var newtable = Array.from(IPv4Collection);

console.log(newtable);
for (i=0;i<newtable.length;i++){
    el = newtable[i];
    console.log(el.parentNode);
    if (el.parentNode.classList[0] == "hide")
    {
        newtable.splice(i, 1)
    }
    
}
console.log(newtable);

var textTable = Array.from(TextCollection);
var allElements = newtable.concat(textTable);

var vlanDuplicate = document.querySelector("#optionalvlan");
var lastHoveredElem;
var counter = 1;

sideBar.style.top = "120px";

addVLANButton.addEventListener("click", addVLAN);
deleteVLANButton.addEventListener("click", deleteVLAN);
systemContainer.addEventListener("mouseenter", sideBarAlignOnHover);
firstVLAN.addEventListener("mouseenter", sideBarAlignOnHover);

function addVLAN(){
    //increasing the vlan counter, cloning it and remvoing the hide option
    counter++
    newVLAN = vlanDuplicate.cloneNode(true);
    newVLAN.classList.remove("hide");
    newVLAN.classList.add("Vlan");
    newVLAN.classList.add("optional");

    if (lastHoveredElem != systemContainer){
        lastHoveredElem.after(newVLAN);
    }
    else{
        firstVLAN.after(newVLAN);
    }
    
    newVLAN.addEventListener("mouseenter", sideBarAlignOnHover)
    newVLAN.id = "vlan"+counter;

    // adding the VLAN to the validation collection
    IPv4Collection = document.getElementsByClassName("ipv4");
    TextCollection = document.getElementsByClassName("text");
    newtable = Array.from(IPv4Collection);
    textTable = Array.from(TextCollection);
    for (i=0;i<newtable.length;i++){
        el = newtable[i];
        console.log(el.parentNode);
        if (el.parentNode.classList[0] == "hide")
        {
            newtable.splice(i, 1)
        }
        
    }

    // changing the ID of the vlan so the err doesn't mess up
    const vlanIP = newVLAN.querySelector("#v0ipv4");
    const spanElement = newVLAN.querySelector("#v0ipv4err");
    vlanIP.id = "v"+counter+"ipv4";
    spanElement.id = vlanIP.id +"err";

    //adding it to all elements
    allElements = newtable.concat(textTable);
    for (i=0; i<newtable.length; i++){
        newtable[i].removeEventListener("blur", ValidateField);
        newtable[i].addEventListener("blur", ValidateField);
    }
    
    for (i=0; i<textTable.length; i++){
        textTable[i].removeEventListener("blur", ValidateField);
        textTable[i].addEventListener("blur", ValidateField);
    }
}

function deleteVLAN(event)
{
    var elem = lastHoveredElem
    console.log(event.target.classList);

    if (elem.classList[1] == "optional")
    {
        elem.parentNode.removeChild(elem);
        sideBar.style.top = "120px";
    }

}

function sideBarAlignOnHover(event){
    lastHoveredElem = event.target;
    sideBar.style.top = "" + event.target.offsetTop +"px";

    if (event.target.classList[1] == "optional")
    {
        deleteVLANButton.classList.remove("hide");
    }
    else{
        deleteVLANButton.classList.add("hide");
    }
    // event.target.style.backgroundColor = ""; works to change the background
}

// table/object to hold the respective classes' error messages
const errMsgs = [
    {
        ipv4: "Must be a valid IP Address",
        text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
        password: "Must be between " + minimum + " - " + maximum + " characters long with no spaces",
    }
]

for (i=0; i<newtable.length; i++){
    newtable[i].addEventListener("blur", ValidateField);
}

for (i=0; i<textTable.length; i++){
    textTable[i].addEventListener("blur", ValidateField);
}



// i didn't track events vs elements properly so gonna have to specify whether it's an event
// or element upon using this function
function MarkError(element, target, err){
    
    if (target == true){
        element.target.style.color = "red";
        element.target.style.border = "2px solid red";
    
        var errID = element.target.id;
        console.log(element.target.id);
        var errDiv = document.getElementById(errID+"err")
        var span = errDiv.getElementsByClassName("msg")[0];
        span.innerText = err;
        errDiv.classList.remove("hide");
        console.log(errDiv);
    }
    else
    {
        element.style.color = "red";
        element.style.border = "2px solid red";
        var errID = element.id;
        console.log(element.id);
        var errDiv = document.getElementById(errID+"err")
        var span = errDiv.getElementsByClassName("msg")[0];
        span.innerText = err;
        errDiv.classList.remove("hide");
        console.log(errDiv);
    }
}

function MarkFine(element, target){

    if (target == true)
    {
        element.target.style.color = "black";
        element.target.style.border = "none";
        errID = element.target.id;
        console.log(element.target.id);
        errDiv = document.getElementById(errID+"err");
        errDiv.classList.add("hide");
    }
    else
    {
        element.style.color = "black";
        element.style.border = "none";
        errID = element.id;
        console.log(element.id);
        errDiv = document.getElementById(errID+"err");
        errDiv.classList.add("hide");
    }

}

function ValidateField(element){
    const IPRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const textRegex = /^[a-zA-Z0-9_-]{4,15}$/;
    const passwordRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{4,15}$/g;
    // the 'type' is the first class in the class list (ipv4 or text)
    const type = element.target.classList[0];

    var match = true;
    var regex; 
    var err;

    if (type == "ipv4"){
        regex = IPRegex
        err = errMsgs[0].ipv4;
    }
    else if (type == "password"){
        regex = passwordRegex;
        err = errMsgs[0].password;
    }
    else {
        regex = textRegex;
        err = errMsgs[0].text;
    }

    match = regex.test(element.target.value);

    if (match==false){
        MarkError(element, true, err);
        console.log(err);

    }
    else {
        MarkFine(element, true)
    }
}

function ValidateIPs(){
    const IPRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const textRegex = /^[a-zA-Z0-9_-]{4,15}$/;
    const passwordRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{4,15}$/g;
    var ableToSubmit = true;
    var regex;
    var err;

    for (i=0; i<allElements.length; i++){
        const type = allElements[i].classList[0];

        if (type == "ipv4"){
            regex = IPRegex
            err = errMsgs[0].ipv4;
        }
        else if (type == "password"){
            regex = passwordRegex;
            err = errMsgs[0].password;
        }
        else {
            regex = textRegex;
            err = errMsgs[0].text;
        }
        
        const match = regex.test(allElements[i].value);

        if (match == false){
            ableToSubmit = false;
            MarkError(allElements[i], false, err)
        }
        else{
            MarkFine(allElements[i], false)
        }
    }

    if (ableToSubmit == true){
        console.log("can submit");
    }
    else{
        console.log("cannot submit");
    }
}


