
var numbers = [];


function displayUserName(number)
{
    numbers.push(number);
    document.getElementById("prosumers").children[0].innerHTML += "<li>"+numbers[numbers.length-1]+"</li>";
}

for (var p in prosumers) {
    displayUserName(prosumers[p].name);
}

console.log(JSON.stringify(prosumers));
