const express = require("express");
const router = express.Router();


//Controllers
const loginController = require("../Controllers/LoginController.js");
const blockLogin = require("./functions/validateLogin.js");
// Página de login
router.get("/", blockLogin.possibleBlockLogin, loginController.login);

// Autenticação de utilizador
router.post("/", blockLogin.possibleBlockLogin, loginController.loginToken);

//Dá logout no user
router.get("/logOut", loginController.logout);

module.exports = router;
