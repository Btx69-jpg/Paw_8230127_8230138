var express = require('express');
var router = express.Router();

//Controller
const indexController = require("../Controllers/IndexController.js");

//middleware
const autoLoginMiddleware = require('../Middleware/AutoLoginMiddleware');

/**
 * * Rota que carrega a pagina inicial
 * 
 * * autoLoginMiddleware --> realiza automaticamente o login do utilizador, caso ele no login
 * * tenha clicado na opção "Lembrar-me"
 * */
router.get('/', autoLoginMiddleware, indexController.indexPage);

module.exports = router;