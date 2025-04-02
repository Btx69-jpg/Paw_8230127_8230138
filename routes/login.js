var express = require('express');
var router = express.Router();
var user = require("../Controllers/LoginController.js"); // Aqui carrego o controller que quero usar

// Entra na pagina de login
router.get('/login', function(req, res) {
  user.login(req, res);
});

// Entra na pagina de registo
router.get('/signUp', function(req, res) {
  user.signup(req, res);
});

module.exports = router;