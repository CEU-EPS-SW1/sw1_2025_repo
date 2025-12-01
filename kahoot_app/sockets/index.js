const fs = require('fs');
const path = require('path');
const { join } = require("node:path");
const sessionMiddleware = require("../config/session");
const { Server } = require("socket.io");

/*
How to use socket.io with express-session
https://socket.io/how-to/use-with-express-session
*/
let io;
const event = require('../events/questions01.json');
const STATES = Object.freeze({
    WAITING: 0,
    START: 1,
    QUESTION: 2,
    ANSWERS: 3,
    QUESTION_END: 4,
    END: 5
});

let kData = {
    state: STATES.WAITING,
    question: -1,
    correctAnswers: {},
    answerIndex: -1,
    answers: {},
    score: {total:{}}
}


module.exports.init = function (httpServer) {
    io = new Server(httpServer);
    io.engine.use(sessionMiddleware);
    io.on("connection", (socket) => {
        const req = socket.request;
        socket.use((__, next) => {
            req.session.reload((err) => {
                if (err) {
                    console.error(err);
                    socket.disconnect();
                } else {
                    next();
                }
            });
        });
        socket.on("kahoot_connect", (cb) => {
            cb(event.title);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

        // Admin events
        socket.on("adminButtonClick", (cb) => {
            if (req.session.user && req.session.user.role === "admin"){
                switch (kData.state) {
                    case STATES.WAITING:
                        kData.question = 0;
                        sendQuestion();
                        break;
                    case STATES.QUESTION:
                        kData.state = STATES.ANSWERS;
                        indexArray = [0,1,2,3];
                        shuffleArray(indexArray);
                        let shuffledAnswers = [];
                        let originalAnswers = event.questions[kData.question].answers;
                        for (let index = 0; index < indexArray.length; index++) {
                            shuffledAnswers[index] = originalAnswers[indexArray[index]];
                            if(indexArray[index] == 0){
                                kData.answerIndex = index;
                                kData.correctAnswers[kData.question] = index;
                            }
                        }
                        socket.emit("admin_answers", shuffledAnswers);
                        io.to("kahoot").emit("kahoot", {questions: true});
                        kData.initTime = Date.now();
                        break;
                    case STATES.ANSWERS:
                        kData.state = STATES.QUESTION_END;
                        let score = getQuestionScore(kData.question);
                        kData.score[kData.question] = score;
                        for (let [key, value] of Object.entries(score)) {
                            kData.score.total[key] = (kData.score.total[key] || 0) + value;
                        }
                        let msg = {answer:kData.answerIndex, score};
                        socket.emit("admin_question_end", msg);
                        break;
                    case STATES.QUESTION_END:
                        kData.question ++;
                        if(kData.question < event.questions.length){
                            sendQuestion();
                        } else {
                            kData.state = STATES.END;
                            let scoreToSend = kData.score.total;
                            /*for (let i = 0; i < 30; i++) {
                                scoreToSend["user0" + i] = parseInt(200 * Math.random());
                            }*/
                            socket.emit("admin_event_end", scoreToSend);
                            saveJSONtoFile(kData);
                        }
                        break;
                }
            }
        });

        function sendQuestion(){
            kData.state = STATES.QUESTION;
            kData.answers[kData.question] = {};
            kData.totalResponses = 0;
            socket.emit("admin_question", event.questions[kData.question].question);
            io.to("kahoot").emit("kahoot", {questions: false});
        }

        // User events
        socket.on("kahoot_answer", (data) => {
            console.log(data);
            if (kData.state == STATES.ANSWERS && req.session.user && req.session.user.role === "user"){
                if(!kData.answers[kData.question].hasOwnProperty(req.session.user.username)){
                    let time = Date.now() - kData.initTime;
                    kData.answers[kData.question][req.session.user.username] = {answer: data, time};
                    kData.totalResponses = (kData.totalResponses || 0) + 1;
                    io.to("/admin").emit("admin_num_answers", kData.totalResponses);
                }
            }
        });

        console.log("User connected");
        if (req.session.user){ //Avoid connecting after server reset
            socket.join("kahoot");
            const clients = io.sockets.adapter.rooms.get('kahoot');
            const num_clients = clients ? clients.size : 0;
            console.log(clients);
            console.log(req.session.user);
            // socket.join(req.session.id);
            if (req.session.user.role === 'admin') {
                socket.join("/admin");
            }
            if (kData.state == STATES.WAITING){
                io.to("/admin").emit("admin_waiting", num_clients);
            }
        }
    });
}

// https://bost.ocks.org/mike/shuffle/
function shuffleArray(array) {
  let currentIndex = array.length;
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function getQuestionScore(num){
    let scoreObj = {};
    let correct = kData.correctAnswers[num];
    for (let [key, value] of Object.entries(kData.answers[num])) {
        if(value.answer == correct){
            if(value.time < 0){
                console.error("Tiempo negativo: " + value.time);
                value.time = 0;
            }
            let score = Math.floor(100 - 60 * Math.min((value.time / 10000), 1));
            scoreObj[key] = score;
        } else {
            scoreObj[key] = 0;
        }
    }
    return scoreObj;
}

function saveJSONtoFile(jsonData){
    const filename = "eventSave_" + new Date().toISOString() + ".json";
    if (!fs.existsSync(process.env.SAVEDIR)){
        fs.mkdirSync(process.env.SAVEDIR);
    }
    const pathName = path.join(process.env.SAVEDIR,filename).replace(/[-:]/g, '');
    fs.writeFile(pathName, JSON.stringify(jsonData), 'utf8', (err) => {
        if (err){
            console.error(err);
        } else {
            console.log("Data saved to file " + filename);
        }
    });
}

module.exports.io = function () {
    return io;
};
