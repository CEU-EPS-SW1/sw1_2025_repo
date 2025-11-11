var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' , user: req.session.user});
});

router.post('/', function(req, res, next) {
    console.log(req.body); //{ user: '', pass: '' }
  // TODO procesar datos login
  if (req.body.user === 'admin'){
    req.session.user = {username: 'admin'};
    res.redirect('restricted');
  } else {
    res.redirect('login');
  }
});

module.exports = router;
