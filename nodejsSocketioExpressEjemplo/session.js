const session = require("express-session");

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

module.exports = sessionMiddleware;