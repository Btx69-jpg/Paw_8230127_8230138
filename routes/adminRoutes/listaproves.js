const express = require("express");
const router = express.Router();

//Controller
const aprovacaoRestController = require("../../Controllers/ControllersAdmin/AprovacaoRestController.js");
const listrestaurantController = require("../../Controllers/ControllersAdmin/ListRestaurantController.js");

/**
 * * Rota que carrega a página para aprovar ou rejeitar restaurantes 
 * */
router.get('/', aprovacaoRestController.aprovePage);

/**
 * * Rota que carrega a página para aprovar ou rejeitar restaurantes 
 * */
router.get('/showRestaurant/:restaurantId', listrestaurantController.showRestaurant);

/**
 * * Rota para aprovar um restaurante, atualizando o seu estado como aprovo, permitinfo com que o mesmo
 * * possa ser visualizado pelos os utilizadores
 * 
 * * restaurantId --> Id do restuarante que vai ser aprovado
 */
router.post('/:restaurantId', aprovacaoRestController.aproveRestaurant);

/**
 * * Rota que rejeita um rejeita um restaurante, removendo-o da DB
 * 
 * * restaurantId --> Id do restuarante que vai ser desaprovado
 */
router.post('/reject/:restaurantId', aprovacaoRestController.rejectRestaurant);

module.exports = router;