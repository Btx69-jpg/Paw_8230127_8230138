var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
var User = require("../Models/Perfils/User");
var signUpController = {};

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
signUpController.signup = function(req, res) {
    res.render("login/signUp");
};


module.exports = signUpController;