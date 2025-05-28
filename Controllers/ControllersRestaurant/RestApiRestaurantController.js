var mongoose = require("mongoose");

//Models
var Restaurant = require("../../Models/Perfils/Restaurant");
var restaurantApiController = {};

// GET /restaurants/:restaurant/orderManagement
restaurantApiController.getRestaurante = function(req, res) {
    const restId = req.params.restId;
    Restaurant.findById(restId).exec()
        .then(restaurant => {
            if(!restaurant) {
                return res.status(404).json({error: "Restaurante não foi encontrado"});
            }
            const copyRest = restaurant.toObject();

            // elimina os campos indesejados
            if (copyRest.perfil) {
                delete copyRest.perfil.perfilPhoto;
            }
            delete copyRest.historicOrders;
            delete copyRest.ownersIds;
            delete copyRest.banned;
            delete copyRest.description;
            delete copyRest.menus;
            delete copyRest.comments;
            console.log("Restaurante encontrado:", copyRest);
            res.status(200).json(copyRest);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        })
};

module.exports = restaurantApiController;