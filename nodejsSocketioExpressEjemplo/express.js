const express = require("express");
const sessionMiddleware = require("./session");
const { join } = require("node:path");
const app = express();
const io = require("./socket").io;

app.use(sessionMiddleware);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.post("/incr", (req, res) => {
  const session = req.session;
  session.count = (session.count || 0) + 1;
  res.status(200).end("" + session.count);

  io().to(session.id).emit("current count", session.count);
});

app.post("/logout", (req, res) => {
  const sessionId = req.session.id;
  req.session.destroy(() => {
    // disconnect all Socket.IO connections linked to this session ID
    io().to(sessionId).disconnectSockets();
    res.status(204).end();
  });
});

module.exports = app;