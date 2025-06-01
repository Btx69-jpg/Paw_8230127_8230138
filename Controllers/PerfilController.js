var mongoose = require("mongoose");

//Models
const User = require("../Models/Perfils/User");

//Controllers
var perfilController = {};

perfilController.deleteAccount = async function(req, res) {
    User.deleteOne( {_id: req.params.adminId}).exec()
        .then(user => {
            if(!user) {
                return res.status(404).render("errors/error", {numError: 404, error: "O utilizador não foi encontrado"});
            }

            console.log("User eliminado com sucesso");
            res.redirect("/");
        }) 
        .catch(error => {
            console.log("Erro :", error);
            res.redirect(res.locals.previousPage);
        })
};

module.exports = perfilController;