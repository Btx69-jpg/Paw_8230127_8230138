var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

//Controllers 
var dish = require("../../Controllers/ControllersRestaurant/DishController.js"); 

//Middlewares
const {authenticateToken} = require("../../Middleware/AuthTokenMiddleware.js");
const {isDonoOrAdmin} = require("../../Middleware/TypeUserMiddleware.js");

/*Rota para dar view numa dish */
router.get('/showDish/:id', dish.showDish);

router.use(authenticateToken, isDonoOrAdmin); //Aplica a autentificação de token e se é admin or dono a todas as rotas abaixo, sem ter de inserir na mesma

/*Depois trocar para /:createDish */
router.get('/createDish', dish.createDish);

/* Rota para guardar um dish */
router.post('/saveDish', dish.saveDish);

/* Rota para editar uma dish */
router.get('/editDish/:id', dish.editDish);

/*Rota para dar update a uma dish */
router.post('/updateDish/:id', dish.updateDish);

/* Rota que dá delete a uma dish*/
router.post('/deleteDish/:id', dish.deleteDish);

module.exports = router;
