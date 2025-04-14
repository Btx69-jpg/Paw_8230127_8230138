var express = require('express');
var router = express.Router();

const signUpController = require("../Controllers/SignUpController.js");
const blockSignUp = require("../Middleware/ValidateLoginMiddleware.js");

// Página de registo
router.get("/", blockSignUp.possibleBlockLogin, signUpController.signup);

// Registo de utilizador
router.post("/", blockSignUp.possibleBlockLogin, signUpController.save);

module.exports = router;