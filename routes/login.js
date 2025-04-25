const express = require("express");
const router = express.Router();

//Controllers
const loginController = require("../Controllers/LoginController.js");
const {possibleBlockLogin} = require("../Middleware/ValidateLoginMiddleware.js");

//Dá logout no user
router.get("/logOut", loginController.logout);

router.use(possibleBlockLogin);

// Página de login
router.get("/", loginController.login);

// Autenticação de utilizador
router.post("/", loginController.loginToken);

module.exports = router;
