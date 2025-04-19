var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

//Controllers 
var restaurant = require("../../Controllers/RestaurantController.js"); 

/* Rota para dar save de menu */
router.post('/saveMenu', restaurant.saveMenu);

/*Depois trocar para /:createDish */
router.get('/createDish', restaurant.createDish);

/* Rota para guardar um dish */
router.post('/saveDish', restaurant.saveDish);

/*Rota para dar view numa dish */
router.get('/showDish/:id', restaurant.showDish);

/* Rota para editar uma dish */
router.get('/editDish/:id', restaurant.editDish);

/*Rota para dar update a uma dish */
router.post('/updateDish/:id', restaurant.updateDish);

/* Rota que dá delete a uma dish*/
router.post('/deleteDish/:id', restaurant.deleteDish);

module.exports = router;
