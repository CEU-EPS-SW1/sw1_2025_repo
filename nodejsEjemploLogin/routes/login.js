const express = require('express');
const router = express.Router();
const database = require('../database');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('login', { user: req.session.user});
});

router.post('/', async function(req, res) {
  const user = req.body.user;
  if(await database.users.isLoginRight(user, req.body.pass)){
    req.session.user = {username: 'admin'};
    req.session.message = "¡Login correcto!";
    res.redirect('restricted');
  } else {
    req.session.error = "¡Usuario o contraseña incorrectos!";
    res.redirect('login');
  }
});

module.exports = router;
