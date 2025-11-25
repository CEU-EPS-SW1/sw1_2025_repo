const { createServer } = require("node:http");
const app = require('./express');

const port = process.env.PORT || 3000;

const httpServer = createServer(app);
require("./socket").init(httpServer);

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
