var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST users signup. */
router.post('/signup', (req, res, next) => {
  //will find usernames that already exist and dissalow use of that username upon signup
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err : err});
      }
      //if username is not taken, we will create a new user
      else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        })
      }
  })
});

/* POST user Login. */
router.post('/login',  passport.authenticate('local'), (req, res,) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Login Successful!'});
});

/* GET user Log Out. */
router.get('/logout', (req, res) => {
  //if a logged in user logs out, all session data will be removed from stored cookies on the server, and redirect to homepage
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  //if the user is not logged in but wants to log out
  else {
    var err = new Error ('You are not logged in.');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
