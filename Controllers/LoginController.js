var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
var User = require("../models/Perfils/User");

var userController = {};

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo

//Preciso de no render mandar também os employees
userController.login = function(req, res) {
    res.render("login/login");
};

userController.signup = function(req, res) {
    res.render("login/signUp");
};


module.exports = userController;