var mongoose = require("mongoose");

var Users = require("../../Models/Perfils/User");
var userController = {};

userController.homePage = async function(req, res) {
    Users.find({ 'perfil.priority': "Cliente"}).exec()
        .then(function(users) {
            res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Users"});
        });
};

userController.desban = async function(req, res) {
    try {
        Users.findOneAndUpdate( {_id: req.params.userId}, { 
            $set: {
                'perfil.banned': true, 
            },
        }, { new: true });
        console.log("User desbanido!");
        
        Users.find({ 'perfil.priority': "Cliente"}).exec()
            .then(function(users) {
                res.render("perfil/admin/PagesAdmin/Users/listUsers", {users: users});
            })
            .catch(function(err) {
                console.log("Error", err);
                res.status(500).send("Problema a procurar pelos Restaurantes");
            });
    } catch(err) {
        console.log("Erro: ", err);
        res.redirect("/perfil/admin/listUsers");
    }
}

module.exports = userController;