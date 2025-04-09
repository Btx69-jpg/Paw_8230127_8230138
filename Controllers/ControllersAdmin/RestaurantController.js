var mongoose = require("mongoose");

var Restaurant = require("../../Models/Perfils/Restaurant");
var restaurantController = {};

restaurantController.homePage = async function(req, res) {
    Restaurant.find({}).exec()
        .then(function(restaurants) {
            res.render("perfil/admin/PagesAdmin/listRestaurants", {restaurants: restaurants});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Restaurantes"});
        });   
};

module.exports = restaurantController;