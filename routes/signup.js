var express = require('express');
var router = express.Router();
const signUpController = require("../Controllers/SignUpController.js");

// Página de registo
router.get("/", signUpController.signup);

// Registo de utilizador
router.post("/", signUpController.save);

module.exports = router;