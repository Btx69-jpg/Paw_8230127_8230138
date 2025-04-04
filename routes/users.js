var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

//Signup route
router.get('/signup', function(req, res, next) {
  res.render('login/signup', { title: 'Express' });
});

//Login route
router.get('/login', function(req, res, next) {
  res.render('login/login', { title: 'Express' });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
