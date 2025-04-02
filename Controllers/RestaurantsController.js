var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
var Restaurants = require("../Models/ArrayPerfils/Restaurants");
var restaurantsController = {};

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
//Preciso de no render mandar também os employees
restaurantsController.restaurantPage = function(req, res) {
    res.render("restaurants/restaurants"); /*Aqui indo o caminho dentro da pasta views */
};

/*Meter codigo, para adicionar, editar e apagar */

module.exports = restaurantsController;