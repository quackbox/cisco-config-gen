// Xan's front-end config gen | created 10/11/2022

// declaring constants, most of these are divs/containers or buttons to be referenced later
const form = document.getElementById("configForm");
const addVLANButton = document.getElementById("addvlan");
const addPFButton = document.getElementById("addPF")
const showOptionsButton = document.getElementById("additems");
const deleteVLANButton = document.getElementById("deleteitem");
const systemContainer = document.getElementById("System");
const firstVLAN = document.getElementById("vlan1");
const sideBar = document.getElementById("sidebar");
const sideBarOptions = document.getElementById("sidebaroptions")
const minimum = 4; // used for regex validation
const maximum = 15;
const optionalPF = document.getElementById("optionalPF");
const vlanDuplicate = document.querySelector("#optionalvlan");
const numberRegex = /(\d+)/;

// table/object to hold the respective classes' error messages
const errMsgs = [
    {
        ipv4: "Must be a valid IP Address",
        text: "Must contain only alphanumeric characters, -, _ and be between " + minimum + " - " + maximum + " characters long with no spaces",
        password: "Must be between " + minimum + " - " + maximum + " characters long with no spaces",
        vID: "Must be between or equal to 2 and 4095",
        portNo: "Must be between or equal to 1 and 65353",
        ipv4altered: "Must be a valid IP address or blank (which results in any)",
        suffix: "Must enter a valid domain name",
        bps: "Must enter a valid number",
    }
]

// declaring variables
// most of these are used in the calcValidationFields function, to track what fields to validate
var IPv4Collection;
var TextCollection;
var checkboxes = document.querySelectorAll('[type="checkbox"]');
var checkboxArray = Array.from(checkboxes);
var newtable;
var textTable;
var allElements; // will be the combination of newtable and texttable once they're filtered of hidden elements
var lastHoveredElem; // used for sideBar QoL purposes
var vlanCounter = 1;
var PFCounter = 0;

// styling
sideBar.style.top = "120px";
sideBar.style.right = "" +  (systemContainer.offsetLeft - 100) + "px";
sideBarOptions.style.width = "0px";
sideBarOptions.top = "120px";

// adding event listeners
// safer to use the ()=>{} when passing paramters, otherwise it runs the function inside on compilation/interpreation without the click
addVLANButton.addEventListener("click", ()=>{
    addItem("Vlan")
});
addPFButton.addEventListener("click", ()=>{
    addItem("PF")
});
showOptionsButton.addEventListener("click", showSideBarOptions);
deleteVLANButton.addEventListener("click", deleteVLAN);
systemContainer.addEventListener("mouseenter", sideBarAlignOnHover);
firstVLAN.addEventListener("mouseenter", sideBarAlignOnHover);

// on submission, filter out the 0 IDs and send to backend
form.addEventListener("submit", function(event){
    event.preventDefault();

    var validated = ValidateAll();
    var newarray = [];
    var i = 1;

    if (validated == true){
        const formData = new FormData(this);

        for (const [key, value] of formData){

            if (key.includes('0')){
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
        fetch('/generate', {
            method: 'post',
            crossorigin: true,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            window.open("/configs/" + data.hostname, "_blank");
        })
        .catch(function(err){
            console.error(err);
        })
    }
    else{
        console.log("there are errors");
    }

})

const fileSelector = document.getElementById('importfile');
// On import, read the file and import the contents
fileSelector.addEventListener('change', (event) => {
    // fileSelector can have multiple files, so each file or the one file, is stored in an array
    // this array is the filelist
  const fileList = event.target.files;
  var giantstring;
  var fieldarray = [];

  var fr=new FileReader();
    fr.onload=function(){
        console.log(fr.result)
        giantstring = fr.result;
        console.log(giantstring)
            
        if (giantstring != null){
            fieldarray.push(giantstring.split(","));
            console.log(fieldarray);
            //is an array of arrays
            ImportData(fieldarray[0]);
        }
    }
    fr.readAsText(fileList[0]);
    //importing

});

const downloadFile = () => {
    const link = document.createElement("a");
    const formData = new FormData(document.getElementById("configForm"));
    var newarray = [];
    var filearray = [];

    for (const [key, value] of formData){

        if (key.includes('0')){
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

    for (const [key, value] of formData){
        filearray.push(key + ":" + value)
    }

    const content = filearray;
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "configexport.txt";
    link.click();
    URL.revokeObjectURL(link.href);
 };

const exportFile = document.getElementById("export");
exportFile.addEventListener('click', downloadFile)

function addImportElement(type, elementTable){
    var counter;

    if (type == "vlan"){
        counter = vlanCounter;
    }
    else if (type == "PF"){
        counter = PFCounter;
    }

    var numbertable = elementTable[0][0].match(/(\d+)/);
    var givenID = numbertable[0]
    var newid = elementTable[0][0].replace(givenID, counter);
    var newel = document.getElementById(newid);
    if (newel.id.includes("dhcpEN")){
        newel.checked = true;
        enableHelper(newel);
    }
    else{
        newel.value = elementTable[0][1];
    }
}

function ImportData(array){
    var currentVlanIDSet = 1;
    var currentPFIDSet = 0;

    for (i = 0; i< array.length; i++){
        var idandvalue = [];
        string = array[i];
        idandvalue.push(string.split(":"));
        //string.split stores the array, in a big array, so access the [0] index
        el = document.getElementById(idandvalue[0][0]);
        if (el != null){
            if (el.id.includes("dhcpEN")){
                el.checked = true;
                enableHelper(el);
            }
            else{
                el.value = idandvalue[0][1];
            }
        }
        // else, check which optional it belongs to (PF, VLAN or IP)
        // then determine whether it's part of the same batch (currentOptionalIDSet) (for example, is it part of VLAN 1's, or starting VLAN 2)
        // if it isn't the same batch, add a new optional DIV, and start filling those in with this batch
        else{
            if(idandvalue[0][0][0].includes("p")){
                if (idandvalue[0][0][1] != currentPFIDSet){
                    currentPFIDSet = idandvalue[0][0][1];
                    addItem("PF");
                    addImportElement("PF", idandvalue);
                }
                else{
                    addImportElement("PF", idandvalue);
                }
            }
            else if (idandvalue[0][0][0].includes("v")){
                if (idandvalue[0][0][1] != currentVlanIDSet){
                    currentVlanIDSet = idandvalue[0][0][1];
                    addItem("Vlan");
                    addImportElement("vlan", idandvalue)
                }
                else{
                    addImportElement("vlan", idandvalue)
                }
            }
        }
    }
    ValidateAll();
}

function initCheckboxes(){
    checkboxes = document.querySelectorAll('[type="checkbox"]');
    checkboxArray = Array.from(checkboxes);
    filter = [];
    
    for (i=0;i<checkboxArray.length;i++){
        if (checkboxArray[i].id.includes('0')){
            filter.push(checkboxArray[i])
        }
    }

    for (i =0; i<filter.length; i++){
        for (j=0;j<checkboxArray.length;j++){
            if (filter[i] == checkboxArray[j])
            checkboxArray.splice(j, 1);
        }
    }

    for (i=0; i< checkboxArray.length; i++){
        checkboxArray[i].removeEventListener("click", enableHelper)
        checkboxArray[i].addEventListener("click", enableHelper)
        enableHelper(checkboxArray[i]);
    }
}

function enableHelper(eventorelement){
    var element;
    if (eventorelement.target != null){
        element = eventorelement.target;
    }
    else{
        element = eventorelement;
    }

    var numbertable = element.id.match(/(\d+)/);
    //returns a table, not really sure which index to use, both the same
    var helperEl = document.getElementById("v"+numbertable[0]+"Helper");
    var helperElLabel = document.getElementById("v"+numbertable[0]+"HelperLabel");

    // should check whether it's a DCHP thing but cba
    if (element.checked == true){
        helperEl.classList.add("hide");
        helperElLabel.classList.add("hide");
        helperEl.value = "";
        ValidateField(helperEl);
    }
    else{

        helperEl.classList.remove("hide");
        helperElLabel.classList.remove("hide");
    }
}

// functions
// calculates how many fields need to be validated (used for adding vlans and final validation)
function calcValidationFields(){
    IPv4Collection = document.getElementsByClassName("ipv4");
    TextCollection = document.getElementsByClassName("text");
    newtable = Array.from(IPv4Collection);
    textTable = Array.from(TextCollection);
    var tempText = [];
    var tempIP = [];

    // mark all fields with a 0 in a new table (to avoid holes)
    for (i=0;i<newtable.length;i++){
        el = newtable[i];
        if (el.parentNode.classList[0] == "hide")
        {
            tempIP[i] = el 
        }
        
    }
    for (i=0;i<textTable.length;i++){
        el = textTable[i];
        if (el.parentNode.classList[0] == "hide")
        {
            tempText[i] = el
        }
    }

    //iterate over the new tables, check for matches in the original tables and delete/splice
    for (i = 0; i < tempText.length;i++){
        for (j = 0; j < textTable.length; j++){
            if (tempText[i] == textTable[j]){
                textTable.splice(j, 1)
            }
        }
    }
    for (i = 0; i < tempIP.length;i++){
        for (j = 0; j < newtable.length; j++){
            if (tempIP[i] == newtable[j]){
                newtable.splice(j, 1)
            }
        }
    }

    // now that the tables are cleannsed, adding it to all elements
    allElements = newtable.concat(textTable);

    for (i=0; i<allElements.length; i++){
        allElements[i].removeEventListener("blur", ValidateField);
        allElements[i].addEventListener("blur", ValidateField);
    }
}

function addItem(type){
    console.log("run");
    var counter;
    var duplicate;
    var headingTitle;
    var desiredHeadingText;
    var desiredID;

    if (type == "Vlan"){
        vlanCounter++;
        duplicate = vlanDuplicate;
        headingTitle = "#vlan0title"
        desiredHeadingText = "Tagged VLAN";
        desiredID = "vlan0title";
        counter = vlanCounter;
    }
    else if (type = "PF"){
        PFCounter++;
        duplicate = optionalPF;
        headingTitle = "#PortForwarding0Title"
        desiredHeadingText = "Port Forwarding 0 Information"
        desiredID = "PortForwarding0Title"
        counter = PFCounter;
    }

    // update the counter, add a new item and adjust the headings accordingly
    newItem = duplicate.cloneNode(true)
    newItem.classList.remove("hide")
    newItem.classList.add(type);
    newItem.classList.add("optional");

    heading = newItem.querySelector(headingTitle);
    heading.id = desiredID.replace("0", counter)
    heading.innerText = desiredHeadingText.replace("0", counter)

    //
    var children = newItem.children;
    for (i = 0; i < children.length; i++){

        if (children[i].name != null){
            children[i].name = children[i].name.replace("0", counter);
        }

        children[i].id = children[i].id.replace("0", counter);
    }

    labels = newItem.getElementsByTagName("Label");
    for (i = 0; i < labels.length; i++){
        oldfor = labels[i].getAttribute("for");
        newfor = oldfor.replace("0", counter);
        labels[i].setAttribute("for", newfor);
        labels[i].innerText = labels[i].innerText.replace("0", counter);
    }

    newItem.addEventListener("mouseenter", sideBarAlignOnHover);

    //need to insert it in the DOM before adding it to validation
    if (lastHoveredElem == null || lastHoveredElem == undefined || lastHoveredElem == systemContainer){
        firstVLAN.after(newItem);
        console.log("inserted")
    }
    else{
        lastHoveredElem.after(newItem);
        console.log("inserted")
    }

    // adding the VLAN to the validation collection
    initCheckboxes();
    calcValidationFields();
}

// adds a VLAN, involves setting the ID's of erros and recalculating how many fields need to be validated
function deleteVLAN(){
    var elem = lastHoveredElem

    if (elem.classList[1] == "optional")
    {
        elem.parentNode.removeChild(elem);
        sideBar.style.top = "120px";
        hideSideBarOptions();
    }
    initCheckboxes();
    calcValidationFields();
}

//aligns the sidebar on the element hovered (VLans and System containers)
function sideBarAlignOnHover(event){

    if (event.target != lastHoveredElem){
        hideSideBarOptions();
    }

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

function showSideBarOptions(){
    sideBarOptions.style.opacity = 1;
    var sideBarRight = sideBar.style.right.replace("px", "");
    sideBarOptions.style.width = "180px";
    var sideBarOptionsWidth = sideBarOptions.style.width.replace("px", "");

    sideBarOptions.style.right = (sideBarRight - sideBarOptionsWidth - 10) +"px";
    sideBarOptions.style.top = sideBar.style.top;
}

function hideSideBarOptions(){
    sideBarOptions.style.width = "0px";
    sideBarOptions.top = "120px";
    sideBarOptions.style.opacity = 0;
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
    const IDregex = /^[2-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-4][0][0-9][0-4]$/;
    const suffixRegex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/g;
    const bpsRegex = /^\d+$/;
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

    //checking classes to validate based on class
    if (type == "ipv4"){
        regex = IPRegex; //testing needs to be IP
        err = errMsgs[0].ipv4;
    }
    else if (type == "password"){
        regex = passwordRegex;
        err = errMsgs[0].password;
    }
    else if (type == "suffix"){
        regex = suffixRegex;
        err = errMsgs[0].suffix
    }
    else {
        regex = textRegex;
        err = errMsgs[0].text;
    }

    if (type == "vID"){
        match = ValidateRange(newelement.value, 2, 4095);
        err = errMsgs[0].vID;
    }
    else if (type == "portNo"){
        match = ValidateRange(newelement.value, 1, 65353);
        err = errMsgs[0].portNo;
    }
    else if (type == "bps"){
        match = ValidateRange(newelement.value, 5000000, 1000000000);
        err = errMsgs[0].bps;
    }
    else if(type == "ipv4altered"){
        regex = IPRegex;
        firstMatch = regex.test(newelement.value);
        secondMatch = false;
        if (newelement.value.length == 0){
            secondMatch = true
        }
        else{
            secondMatch = false;
        }

        if (firstMatch == true || secondMatch == true){
            match = true
        }
        else{
            match = false;
            err = errMsgs[0].ipv4altered
        }
    }
    else{
        match = regex.test(newelement.value);
    }

    // if match is true, mark it fine else mark an error
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
initCheckboxes();
calcValidationFields();