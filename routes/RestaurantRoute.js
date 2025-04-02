/*Aqui e o nosso HomePage, que vai ter o cmainho,
para a pagina principal, com o menu, avaliações
E também para a pagina com os pratos do menu
*/
var express = require('express');
var router = express.Router();
var restaurant = require("../Controllers/RestaurantController.js"); // Aqui carrego o controller que quero usar

/* Entra na Home Page do restaurante 
(vai ter de carregar, o restaurante carregado na primeira página) */ 
router.get('/', function(req, res) {
    restaurant.homePage(req, res);
});

// Entra na pagina de registo
//Depois em vez de /menu, meter /:menu, para aparecer o nome do menu
router.get('/menu', function(req, res) {
    restaurant.menu(req, res);
});

router.get('/menu/createPrato', function(req, res) {
    restaurant.prato(req, res);
});

router.get('/menu/prato', function(req, res) {
    restaurant.prato(req, res);
});

//Permite criar uma nova dish
router.get('/menu/createDish', function(req, res) {
    restaurant.prato(req, res);
});

module.exports = router;