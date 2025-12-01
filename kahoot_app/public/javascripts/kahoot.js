const socket = io({});
const titleElem = document.getElementById("title");
const answersElem = document.getElementById("answers");
const button0 = document.getElementById("answer0");
const button1 = document.getElementById("answer1");
const button2 = document.getElementById("answer2");
const button3 = document.getElementById("answer3");
const BUTTONS = [button0, button1, button2, button3];

socket.on("connect", () => {
    console.log("Connected");
    socket.emit("kahoot_connect", (data) => {
        titleElem.innerText = data;
    });
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("kahoot", (data) => {
    console.log("kahoot: " + data);
    if (data.questions){
        enableButtons();
        answersElem.classList.remove("d-none");
    } else {
        unselectAndHideAllButtons();
    }
});

for (let i = 0; i < BUTTONS.length; i++) {
    BUTTONS[i].addEventListener("click", () => {buttonClicked(i);});
}

function buttonClicked(buttonId){
    socket.emit("kahoot_answer", buttonId);
    selectButton(buttonId);
    BUTTONS.forEach((button) => {button.disabled = true});
}

function enableButtons(){
    BUTTONS.forEach((button) => {button.disabled = false});
}

function selectButton(buttonId){
    BUTTONS[buttonId].classList.add("selectedButton");
}

function unselectAndHideAllButtons(){
    answersElem.classList.add("d-none");
    BUTTONS.forEach((button) => {
        button.classList.remove("selectedButton");
    });
}
