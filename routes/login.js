var express = require('express');
var router = express.Router();
var user = require("../Controllers/LoginController.js"); // Aqui carrego o controller que quero usar

// Entra na pagina de login
router.get('/', function(req, res) {
  user.login(req, res);
});

module.exports = router;