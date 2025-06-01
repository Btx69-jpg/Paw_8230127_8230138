const express = require("express");
const router = express.Router();

//Controllers
const cokkiesController = require("../../Controllers/CookiesAngular");


/**
 * * Rota que permite ao utilizador fazer logout da sua sessão
 * */
router.get("/auth/:userId", cokkiesController.authCheck);

/**
 * * Verifca se o tipo do utilizador é dono ou cliente
 */
router.get("/authIsDonoOrCliente", cokkiesController.authIsDonoOrCliente);

module.exports = router;
