/*Aqui e o nosso HomePage, que vai ter o cmainho,
para a pagina principal, com o menu, avaliações
E também para a pagina com os pratos do menu
*/
var express = require('express');
var router = express.Router();
var restaurants = require("../Controllers/RestaurantsController.js"); // Aqui carrego o controller que quero usar

/* Entra na Home Page do restaurante 
(vai ter de carregar, o restaurante carregado na primeira página) */ 
router.get('/', function(req, res) {
    restaurants.restaurantPage(req, res);
});

/*Depois criar os get e post para criar os varios restaurantes */

module.exports = router;
