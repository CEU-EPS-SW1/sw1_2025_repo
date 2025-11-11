const express = require('express');

const app = express();
const port = 3000;

var myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
}
app.use(myLogger);app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});