/*Aqui e o nosso HomePage, que vai ter o cmainho,
para a pagina principal, com o menu, avaliações
E também para a pagina com os pratos do menu
*/
var express = require('express');
var router = express.Router();
var restaurant = require("../Controllers/RestaurantController.js"); // Aqui carrego o controller que quero usar

/* Entra na Home Page do restaurante
(vai ter de carregar, o restaurante carregado na primeira página) */ 
/*Depois trocar para /:restaurant */
router.get('/:restaurant', function(req, res) {
    restaurant.homePage(req, res);
});

/*Depois trocar para /:restaurant/:comments */
/*
router.get('/:restaurant/comments', function(req, res) {
    restaurant.comments(req, res);
});
*/
// Entra na pagina de registo
//Depois em vez de /menu, meter /:menu, para aparecer o nome do menu
/*Depois trocar para /:restaurant/:menu NÃO TROCAR AGORA SE NÃO O CREATE MENU DEIXA DE DAR */
router.get('/:restaurant/menu', function(req, res) {
    restaurant.showMenu(req, res);
});

/*Depois trocar para /:restaurant/:menu/createMenu */
router.get('/:restaurant/createMenu', restaurant.createMenu);

//Salva o menu criado
router.post('/:restaurant/menu/saveMenu', function(req, res) {
    restaurant.saveMenu(req, res);
});

//Permite criar uma nova dish
/*Depois trocar para /:restaurant/:menu/createDish */
router.get('/:restaurant/menu/createDish', function(req, res) {
    restaurant.createDish(req, res);
});

router.post('/:restaurant/menu/saveDish', function(req, res) {
    restaurant.saveDish(req, res);
});

/*Depois trocar para /:restaurant/:menu/:prato */
router.get('/:restaurant/menu/showDish/:id', function(req, res) {
    restaurant.showDish(req, res);
});

/*Depois trocar para /:restaurant/:menu/:prato 
Falta fazer
*/
router.get('/:restaurant/menu/editDish/:id', function(req, res) {
    restaurant.editDish(req, res);
});

/*Falta fazer */
router.post('/:restaurant/menu/updateDish/:id', function(req, res) {
    restaurant.updateDish(req, res);
});

/*Falta fazer */
router.post('/:restaurant/menu/deleteDish/:id', function(req, res) {
    restaurant.deleteDish(req, res);
});

module.exports = router;
