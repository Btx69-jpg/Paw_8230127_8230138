var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");

/**
 * TODO: Falta depois fazer o redirect correto.
 */

var userController = {};

userController.getUser = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).render("errors/error", { numError: 500, error: error });
        });
}

userController.historicOrders = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if(!user.perfil || !user.perfil.historicOrders) {
                return res.status(404).json({ error: "User não tem historico de encomendas" });
            }
            res.status(200).json();
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).render("errors/error", { numError: 500, error: error });
        });
}

module.exports = userController;