
const IPv4Collection = document.getElementsByClassName("ipv4");
const newtable = Array.from(IPv4Collection);

const ElementStyles = [];

for (i=0; i<newtable.length; i++){
    newtable[i].addEventListener("blur", ValidateIP);
    ElementStyles[i] = newtable[i];
    ElementStyles[i].color = newtable[i].style.color;
    console.log(ElementStyles[i], newtable[i], newtable[i].style.color, ElementStyles[i].color );
}

function MarkError(element){
    element.target.style.color = "red";
    element.target.style.border = "2px solid red";
}

function MarkFine(element){
    element.target.style.color = "black";
    element.target.style.border = "none";
}

function ValidateIP(element){
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const match = regex.test(element.target.value);
    console.log(match);
    console.log(element.target.value);

    if (match==false){
        MarkError(element);
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

console.log(newtable[0]);


