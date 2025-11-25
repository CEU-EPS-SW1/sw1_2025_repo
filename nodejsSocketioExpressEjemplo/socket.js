const { Server } = require("socket.io");
const sessionMiddleware = require("./session");

let io;

module.exports.init = function(httpServer){
    io = new Server(httpServer);
    io.engine.use(sessionMiddleware);

    io.on("connection", (socket) => {
    const req = socket.request;

    socket.join(req.session.id);

    socket.on("incr", (cb) => {
        req.session.reload((err) => {
        if (err) {
            // session has expired
            return socket.disconnect();
        }
        req.session.count = (req.session.count || 0) + 1;
        req.session.save(() => {
            cb(req.session.count);
        });
        });
    });
    });
}

module.exports.io = function(){
    return io;
}