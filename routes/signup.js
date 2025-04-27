var express = require('express');
var router = express.Router();

//Controllers
const signUpController = require("../Controllers/SignUpController.js");

//Middlewares
const {possibleBlockLogin} = require("../Middleware/ValidateLoginMiddleware.js");

/**
 * * Aquila o middleware para block, nas rotas abaixo
 * 
 * * possibleBlockLogin --> caso o utilizador já esteja autenticado, impedio de aceder as rotas de login
 * */
router.use(possibleBlockLogin)

/**
 * * Rota que carrega a pagina de signUp.
 * */
router.get("/", signUpController.signup);

/**
 * * Rota que cria a conta do utilizador
 * */
router.post("/", signUpController.save);

module.exports = router;