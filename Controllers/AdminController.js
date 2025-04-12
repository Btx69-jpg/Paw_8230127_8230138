var mongoose = require("mongoose");

//Models
const User = require("../Models/Perfils/User");

//Controllers
var adminController = {};

adminController.homePage = function(req, res) {
    res.render("perfil/admin/adminPage");
};

//Se calhar antes do delete se tudo estiver vem o melhor é dar o logout
adminController.deleteAdm = async function(req, res) {
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

module.exports = adminController;