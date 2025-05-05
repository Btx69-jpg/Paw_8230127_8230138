var express = require('express');
var router = express.Router();

//Controller
const indexController = require("../Controllers/IndexController.js");

//middleware
const autoLoginMiddleware = require('../Middleware/AutoLoginMiddleware');

const getRestaurants = require('../Middleware/LoadRestaurantsMiddleWare');

/**
 * * Rota que carrega a pagina inicial
 * 
 * * autoLoginMiddleware --> realiza automaticamente o login do utilizador, caso ele no login
 * * tenha clicado na opção "Lembrar-me"
 * */
router.get('/', autoLoginMiddleware, getRestaurants, indexController.indexPage);

/**
 * * Rota que permite ao utilizador pesquisar por um restaurante especifico
 */
router.get('/search', indexController.search);

module.exports = router;