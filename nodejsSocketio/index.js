//servidor
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ }); 
//…
io.on('connection', (socket) => {
    console.log('a user connected'); 
    socket.on('disconnect', () => {
    console.log('user disconnected');
    });
}); 
httpServer.listen(3000);