var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");
const Restaurant = require("../Models/Perfils/Restaurant");

//Controllers
var perfilController = {};

//Se calhar antes do delete se tudo estiver vem o melhor é dar o logout
perfilController.deleteAccount = async function(req, res) {
    User.deleteOne( {_id: req.params.adminId}).exec()
        .then(user => {
            console.log("User eliminado com sucesso");
            res.redirect("/");
        }) 
        .catch(error => {
            console.log("Erro :", error);
            res.redirect(res.locals.previousPage);
        })
};

module.exports = perfilController;