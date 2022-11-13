// Xan's front-end config gen | created 10/11/2022
// declaring constants, most of these are divs/containers or buttons to be referenced later
const form = document.getElementById("configForm");
const addVLANButton = document.getElementById("addvlan");
const deleteVLANButton = document.getElementById("deletevlan");
const systemContainer = document.getElementById("System");
const firstVLAN = document.getElementById("vlan1");
const sideBar = document.getElementById("sidebar");
const minimum = 4; // used for regex validation
const maximum = 15;

// table/object to hold the respective classes' error messages
const errMsgs = [
    {
        ipv4: "Must be a valid IP Address",
        text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
        password: "Must be between " + minimum + " - " + maximum + " characters long with no spaces",
        vID: "Must be between or equal to 2 and 4095",
    }
]

// declaring variables
// most of these are used in the calcValidationFields function, to track what fields to validate
var IPv4Collection;
var TextCollection;
var newtable;
var textTable;
var allElements; // will be the combination of newtable and texttable once they're filtered of hidden elements
var vlanDuplicate = document.querySelector("#optionalvlan");
var lastHoveredElem; // used for sideBar QoL purposes
var vlanCounter = 1;

// styling
sideBar.style.top = "120px";
sideBar.style.right = "" +  (systemContainer.offsetLeft - 100) + "px";

// adding event listeners

addVLANButton.addEventListener("click", addVLAN);
deleteVLANButton.addEventListener("click", deleteVLAN);
systemContainer.addEventListener("mouseenter", sideBarAlignOnHover);
firstVLAN.addEventListener("mouseenter", sideBarAlignOnHover);

form.addEventListener("submit", function(event){
    event.preventDefault();

    var validated = ValidateAll();
    var newarray = [];
    var i = 1;

    if (validated == true){
        const formData = new FormData(this);

        for (const [key, value] of formData){
            console.log([key, value]);
            const regex = /^v0/;

            if (regex.test(key) == true){
                // formData.delete(key) causes holes? I think?
                newarray[i] = key;
                i++;
            }
        }

        for (j=0;j<newarray.length;j++){
            for (const [key, value] of formData){
                if (newarray[j] == key){
                    formData.delete(key);
                }
            }
        }

        console.log(formData)


        // collecion of key value pairs which match the id and id value
        fetch('http://127.0.0.1:5000/generate', {
            method: 'post',
            crossorigin: true,
            body: formData
        }).then (function(response){
            return response.text;
        }).then (function(text){
            console.log(text);
        }).catch(function(err){
            console.error(err);
        })
    }
    else{
        console.log("there are errors");
    }

})

// functions
// calculates how many fields need to be validated (used for adding vlans and final validation)
function calcValidationFields(){
    IPv4Collection = document.getElementsByClassName("ipv4");
    TextCollection = document.getElementsByClassName("text");
    newtable = Array.from(IPv4Collection);
    textTable = Array.from(TextCollection);

    for (i=0;i<newtable.length;i++){
        el = newtable[i];
        if (el.parentNode.classList[0] == "hide")
        {
            newtable.splice(i, 1)
        }
        
    }
    for (i=0;i<textTable.length;i++){
        el = textTable[i];
        if (el.parentNode.classList[0] == "hide")
        {
            textTable.splice(i, 1)
        }
        
    }

    //adding it to all elements
    allElements = newtable.concat(textTable);
    console.log(allElements);

    for (i=0; i<allElements.length; i++){
        allElements[i].removeEventListener("blur", ValidateField);
        allElements[i].addEventListener("blur", ValidateField);
    }
}

// adds a VLAN, involves setting the ID's of erros and recalculating how many fields need to be validated
function addVLAN(){
    //increasing the vlan counter, cloning it and remvoing the hide option
    vlanCounter++
    newVLAN = vlanDuplicate.cloneNode(true);
    newVLAN.id = "vlan"+vlanCounter;
    newVLAN.classList.remove("hide");
    newVLAN.classList.add("Vlan");
    newVLAN.classList.add("optional"); //allows it to be deleted

    // changing the ID of the vlan so the err doesn't mess up
    const title = newVLAN.querySelector("#vlan0title");

    const vlanIP = newVLAN.querySelector("#v0ipv4");
    const vlanIPLabel = newVLAN.querySelector("#v0ipv4Label");
    const spanElement = newVLAN.querySelector("#v0ipv4err");

    const vlanIDEntry =  newVLAN.querySelector("#v0ID");
    const vlanIDEntryLabel = newVLAN.querySelector("#v0IDLabel");
    const vlanIDerr = newVLAN.querySelector("#v0IDerr");

    const vlanIPPreLabel = newVLAN.querySelector("#v0ipPreLabel");
    const vlanIPPre = newVLAN.querySelector("#v0ipPre");

    const vlanDHCPenLabel = newVLAN.querySelector("#v0dhcpENLabel");
    const vlanDHCPen = newVLAN.querySelector("#v0dhcpEN");

    // changing all the individual elements
    title.id = "vlan"+vlanCounter+"title";
    title.innerText = "Vlan " + vlanCounter + " Information";

    vlanIPLabel.id = "v"+vlanCounter+"ipv4Label"
    vlanIPLabel.innerText = "Vlan " + vlanCounter + " IPv4 Interface"
    vlanIP.id = "v"+vlanCounter+"ipv4";
    vlanIP.name = vlanIP.id;
    spanElement.id = vlanIP.id +"err";


    vlanIDEntryLabel.id = "v"+vlanCounter+"IDLabel"
    vlanIDEntryLabel.innerText = "Vlan " + vlanCounter + " ID" 
    vlanIDEntry.id = "v"+vlanCounter+"ID";
    vlanIDEntry.name = vlanIDEntry.id;
    vlanIDerr.id = vlanIDEntry.id +"err";

    vlanIPPreLabel.id = "v"+vlanCounter+"ipPreLabel";
    vlanIPPre.id = "v"+vlanCounter+"ipPre";
    vlanIPPre.name = vlanIPPre.id;

    vlanDHCPenLabel.id = "v"+vlanCounter+"dhcpENLabel";
    vlanDHCPenLabel.innerText = "Enable DHCPv4 Server on VLAN "+ vlanCounter;
    vlanDHCPen.id = "v"+vlanCounter+"dhcpEN";
    vlanDHCPen.name = vlanDHCPen.id;

    newVLAN.addEventListener("mouseenter", sideBarAlignOnHover)

    //need to insert it in the DOM before adding it to validation
    if (lastHoveredElem != systemContainer){
        lastHoveredElem.after(newVLAN);
    }
    else{
        firstVLAN.after(newVLAN);
    }

    // adding the VLAN to the validation collection
    calcValidationFields();

}

function deleteVLAN(event){
    var elem = lastHoveredElem

    if (elem.classList[1] == "optional")
    {
        elem.parentNode.removeChild(elem);
        sideBar.style.top = "120px";
    }

    calcValidationFields();
}

//aligns the sidebar on the element hovered (VLans and System containers)
function sideBarAlignOnHover(event){
    lastHoveredElem = event.target;
    sideBar.style.top = "" + event.target.offsetTop +"px";
    sideBar.style.right = "" +  (event.target.offsetLeft - 100) + "px";

    if (event.target.classList[1] == "optional")
    {
        deleteVLANButton.classList.remove("hide");
    }
    else{
        deleteVLANButton.classList.add("hide");
    }
}

// marks validation failed elements with an error
function MarkError(element, err){
    var newelement
    //checks whether an event or element is being passed through
    if (element.target != null){
        //if it's an event, set the element to the target of that event
        newelement = element.target;
    }
    else{
        newelement = element;
    }

    newelement.style.color = "red";
    newelement.style.border = "2px solid red";
    var errID = newelement.id;
    var errDiv = document.getElementById(errID+"err")
    var span = errDiv.getElementsByClassName("msg")[0];
    span.innerText = err;
    errDiv.classList.remove("hide");
}

// unmarks
function MarkFine(element){
    var newelement
    if (element.target != null){
        newelement = element.target;
    }
    else{
        newelement = element;
    }

    newelement.style.color = "black";
    newelement.style.border = "none";
    errID = newelement.id;
    errDiv = document.getElementById(errID+"err");
    errDiv.classList.add("hide");
}

// validates whether the input is a number, and between min and max
function ValidateRange(number, minimum, maximum){
    console.log(number);
    var match = false;
    if (!isNaN(number)){
        newnumber = parseInt(number);
        if (newnumber >= minimum && newnumber <= maximum){
            match = true;
        }
    }
    return match;
}

// validates a field depending on its class or type (ipv4, text, password or vlanID)
function ValidateField(element){
    const IPRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const textRegex = /^[a-zA-Z0-9_-]{4,15}$/;
    const passwordRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{4,15}$/g;
    const IDregex = /^[2-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-4][0][0-9][0-4]$/
    // the 'type' is the first class in the class list (ipv4 or text)

    var match = true;
    var regex; 
    var err;
    var newelement;
    if (element.target != null){
        newelement = element.target;
    }
    else{
        newelement = element;
    }

    const type = newelement.classList[0];

    if (type == "ipv4"){
        regex = IPRegex; //testing needs to be IP
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

    if (type == "vID"){
        match = ValidateRange(newelement.value, 2, 4095);
        err = errMsgs[0].vID;
    }
    else{
        match = regex.test(newelement.value);
    }

    if (match==false){
        MarkError(newelement, err);
    }
    else {
        MarkFine(newelement);
    }
    return match;
}

// validates all fields in the AllElements table
function ValidateAll(){
    var ableToSubmit = true;

    for (i=0; i<allElements.length; i++){
        const type = allElements[i].classList[0];
        var match;
        match = ValidateField(allElements[i]);
        
        if (match == false){
            ableToSubmit = false;
        }
    }

    return ableToSubmit;
}

// Functions to be run
calcValidationFields();


