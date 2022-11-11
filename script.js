
const IPv4Collection = document.getElementsByClassName("ipv4");
const TextCollection = document.getElementsByClassName("text");

const newtable = Array.from(IPv4Collection);
const textTable = Array.from(TextCollection);

const minimum = 4;
const maximum = 15;

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


function MarkError(element){
    element.target.style.color = "red";
    element.target.style.border = "2px solid red";
    var errMsg = document.querySelector("#originalerr")
    var errClone = errMsg.cloneNode("true")
    errClone.classList.remove("hide")
    console.log(element.target);
    console.log(errMsg);
    element.target.after(errClone)
}

function MarkFine(element){
    element.target.style.color = "black";
    element.target.style.border = "none";
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
        MarkError(element);
        console.log(err);

    }
    else {
        MarkFine(element)
    }
}

function ValidateIPs(){
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var ableToSubmit = true;
    for (i=0; i<newtable.length; i++){
        const match = regex.test(newtable[i].value);

        if (match == false){
            ableToSubmit = false;
        }
    }

    if (ableToSubmit == true){
        console.log("can submit");
    }
    else{
        console.log("cannot submit");
    }
}


