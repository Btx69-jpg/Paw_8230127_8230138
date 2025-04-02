var express = require('express');
var router = express.Router();
var sign = require("../Controllers/SignUpController.js"); // Aqui carrego o controller que quero usar

// Entra na pagina de registo
router.get('/', function(req, res) {
  sign.signup(req, res);
});

module.exports = router;