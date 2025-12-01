const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
  if(req.session.user.role === 'admin'){
    res.render('kahoot_admin', {user: req.session.user});
  } else {
    res.render('kahoot', {user: req.session.user});
  }
});

module.exports = router;
