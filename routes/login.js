const express = require("express");
const router = express.Router();

//Controllers
const loginController = require("../Controllers/LoginController.js");

// Página de login
router.get("/", loginController.login);

// Autenticação de utilizador
router.post("/", loginController.loginToken);

//Dá logout no user
router.get("/logOut", loginController.logout);

module.exports = router;
