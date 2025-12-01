const socket = io({});
const titleElem = document.getElementById("title");
const mainContentElem = document.getElementById("mainContent");
const answersElem = document.getElementById("answers");
const adminButtonElem = document.getElementById("adminButton");
const button0 = document.getElementById("answer0");
const button1 = document.getElementById("answer1");
const button2 = document.getElementById("answer2");
const button3 = document.getElementById("answer3");
const BUTTONS = [button0, button1, button2, button3];
const SIM_TR = '<i class="bi bi-triangle-fill"></i>';
const SIM_DI = '<i class="bi bi-diamond-fill"></i>';
const SIM_CI = '<i class="bi bi-circle-fill"></i>';
const SIM_SQ = '<i class="bi bi-square-fill"></i>';
let question = "";

socket.on("connect", () => {
    console.log("Connected");
    socket.emit("kahoot_connect", (data) => {
        titleElem.innerText = data;
    });
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("admin_waiting", (data) => {
    console.log("admin_waiting: " + data);
    mainContent.innerHTML = `<p class="text-center fs-2">Usuarios conectados: ${data}</p>`;
});

socket.on("admin_question", (data) => {
    console.log("admin_question: " + data);
    unselectAndHideAllButtons();
    question = `<p class="text-center fs-1">${data}</p>`;
    mainContent.innerHTML = question;
});

socket.on("admin_answers", (data) => {
    console.log("admin_answers" + data);
    button0.innerHTML = `${SIM_TR} ${data[0]}`;
    button1.innerHTML = `${SIM_DI} ${data[1]}`;
    button2.innerHTML = `${SIM_CI} ${data[2]}`;
    button3.innerHTML = `${SIM_SQ} ${data[3]}`;
    answersElem.classList.remove("d-none");
    mainContent.innerHTML = question + '<p class="text-center fs-3">Número de respuestas: 0</p>';
});

socket.on("admin_num_answers", (data) => {
    mainContent.innerHTML = `${question}<p class="text-center fs-3">Número de respuestas: ${data}</p>;`;
});

socket.on("admin_question_end", (data) => {
    console.log("admin_question_end" + data);
    selectButton(data.answer);
    mainContent.innerHTML = getTable(data.score);
});

socket.on("admin_event_end", (data) => {
    answersElem.remove();
    let txt =  '<p class="text-center fs-3">¡Muchas gracias a todos!</p><p class="text-center fs-2">PUNTUACIÓN FINAL</p>';
    txt += getTable(data);
    mainContent.innerHTML = txt;
});

adminButtonElem.addEventListener("click", () => {
    socket.emit("adminButtonClick",);
    console.log("Admin button clicked");
});

function selectButton(buttonId){
    BUTTONS[buttonId].classList.add("selectedButton");
}

function unselectAndHideAllButtons(){
    answersElem.classList.add("d-none");
    BUTTONS.forEach((button) => {
        button.classList.remove("selectedButton");
    });
}

function getTable(data){
    orderedData = getSortedArrayFromObject(data);
    console.log(orderedData);
    let table = '<table  class="table table-sm centerTable"><tr><th>Jugador</th><th>Puntuación</th>';
    if (orderedData){
        orderedData.forEach((elem) => {
            table += `<tr><td>${elem[0]}</td><td>${elem[1]}</td></tr>`
        });
    }
    table += "</table>";
    return table;
}

function getSortedArrayFromObject(obj){
    let sortable = [];
    for (let elem in obj) {
        sortable.push([elem, obj[elem]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    return sortable;
}
