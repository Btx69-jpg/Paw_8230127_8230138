var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");
const Restaurant = require("../Models/Perfils/Restaurant");

//Controllers
var perfilController = {};

//Se calhar antes do delete se tudo estiver vem o melhor é dar o logout
/**
 * Falta renderizar a pagina para manage das moradas
 */
userController.manageAddress = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if(!user.addresses) {
                return res.status(404).json({ error: "User não tem moradas" });
            }

            //address: user.addresses
            res.status(200).json();
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).render("errors/error", { numError: 500, error: error });
        });
}

/** Pagina para filtar as moradas*/
userController.searchAddress = function(req, res) {}

/* Página que cria uma nova morada (limite de moradas é 5) */
userController.createAddress = function(req, res) {}

/* Controller que guarda uma nova morada*/
userController.saveAddress = function(req, res) {}

/* Página que edita uma nova morada */
userController.editAddress = function(req, res) {}

/* Controller que atualiza a morada */
userController.updateAddress = function(req, res) {}

/* Controller que elimina a morada */
userController.deleteAddress = function(req, res) {}

module.exports = perfilController;