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
router.get('/:restaurant', restaurant.homePage);

/*Depois trocar para /:restaurant/:comments */
router.get('/:restaurant/comments', restaurant.comments);

// Entra na pagina de registo
//Depois em vez de /menu, meter /:menu, para aparecer o nome do menu
/*Depois trocar para /:restaurant/:menu */
router.get('/:restaurant/showMenu/:menu', restaurant.showMenu);

/*Depois trocar para /:restaurant/:menu/createMenu */
router.get('/:restaurant/createMenu', restaurant.createMenu);

//Salva o menu criado
router.post('/:restaurant/menu/saveMenu', restaurant.saveMenu);

router.get('/:restaurant/editMenu/:menuId', restaurant.editMenu);

router.post('/:restaurant/updateMenu/:menuId', restaurant.saveEditMenu);

//Permite criar uma nova dish
/*Depois trocar para /:restaurant/:menu/createDish */
router.get('/:restaurant/menu/createDish', restaurant.createDish);

router.post('/:restaurant/menu/saveDish', restaurant.saveDish);

/*Depois trocar para /:restaurant/:menu/:prato */
router.get('/:restaurant/menu/showDish/:id', restaurant.showDish);

/*Depois trocar para /:restaurant/:menu/:prato 
Falta fazer
*/
router.get('/:restaurant/menu/editDish/:id', restaurant.editDish);

/*Falta fazer */
router.post('/:restaurant/menu/updateDish/:id', restaurant.updateDish);

/*Falta fazer */
router.post('/:restaurant/menu/deleteDish/:id', restaurant.deleteDish);

module.exports = router;
