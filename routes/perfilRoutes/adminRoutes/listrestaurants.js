const express = require("express");
const router = express.Router();

//Controllers
const restaurantsController = require("../../../Controllers/RestaurantsController.js");
const listrestaurantController = require("../../../Controllers/ControllersPerfil/ControllersAdmin/ListRestaurantController.js");

//Routers
const aprovesRouter = require("./listaproves.js");

/** 
 * * Rota que carrega a pagina com a lista de todos os restuarantes 
 * */
router.get('/', listrestaurantController.homePage);

/** 
 * * Rota que carrega a pagina para visualizar os dados de um restaurante especifico 
 * 
 * * restaurantId --> id do restaurante a ser visualizado
 * */
router.get('/showRest/:restaurantId', listrestaurantController.showRestaurant);

/**
 * * Rota para puder filtar por restaurantes, e definir um criterio de ordenação 
 * */
router.get('/search', restaurantsController.search);

/**
 * * Rota para renderizar a pagina para criar um restaurante 
 * */
router.get('/createRestaurant', restaurantsController.createRestaurant)

/**
 * * Rota que guarda um restarante criado na pagina "createRestaurant"
 * */
router.post('/saveRestaurant', restaurantsController.saveRestaurant)

/**
 * * Rota para renderizar a pagina para editar restaurante
 * 
 * * restaurantId --> Id do restuarante que vai ser editado
 * */
router.get('/editRestaurant/:restaurantId', restaurantsController.editRestaurant)

/**
 * * Rota que guarda as alterações realizas a um restaurante 
 * 
 * * restaurantId --> Id do restuarante que vai ser atualizado
 * */
router.post('/updatRestaurant/:restaurantId', restaurantsController.updatRestaurant);

/**
 * * Rota que elimina um restaurante
 * 
 * * restaurant --> Id do restuarante que vai ser removido
 * */
router.post('/deleteRestaurant/:restaurant', restaurantsController.removeRestaurant);

/**
 * * Importação do router com as rotas que permitem ao admin ver os restaurantes que precisam
 * * de aprovação e aprovar ou rejeitar 
 * */
router.use('/aproves', aprovesRouter);

module.exports = router;