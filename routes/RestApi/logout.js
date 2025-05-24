const express = require("express");
const router = express.Router();

//Controllers
const loginController = require("../../Controllers/LoginController.js");


/**
 * * Rota que permite ao utilizador fazer logout da sua sessão
 * */
router.get("/", loginController.logoutAngular);

module.exports = router;
