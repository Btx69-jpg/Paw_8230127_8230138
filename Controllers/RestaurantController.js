var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
var Restaurant = require("../Models/Perfils/Restaurant");

var restaurantController = {};

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
//Preciso de no render mandar também os employees
restaurantController.homePage = function(req, res) {
    //Copiar o veiw da ficha6, para mostar apenas 1 restaurante e mandar no render
    //Depois meter res.redirect("/employees/show/" + employee._id);
    res.render("restaurant/HomePage/homepage");
};

//Permite visualizar um menu especifico de um restaurante
restaurantController.menu = function(req, res) {
    res.render("restaurant/menu");
};

//Permite criar um novo menu no restaurante
restaurantController.createMenu = function(req, res) {
    res.render("restaurant/createMenu");
};

//Permite com detalhes o prato especifico de um menu
restaurantController.prato = function(req, res) {
    res.render("restaurant/dishs");
};

//Permite criar um novo prato ao menu
restaurantController.createDish = function(req, res) {
    res.render("restaurant/createDish");
};

module.exports = restaurantController;