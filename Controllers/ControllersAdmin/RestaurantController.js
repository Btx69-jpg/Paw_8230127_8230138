var mongoose = require("mongoose");

var Restaurant = require("../../Models/Perfils/Restaurant");
var restaurantController = {};

restaurantController.homePage = async function(req, res) {
    Restaurant.find({}).exec()
        .then(function(restaurants) {
            res.render("perfil/admin/PagesAdmin/Restaurant/listRestaurants", {restaurants: restaurants});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Restaurantes"});
        });   
};

restaurantController.aprovePage = async function(req, res) {
    Restaurant.find({ aprove: false}).exec()
        .then(function(restaurants) {
            if(restaurants.length > 0) {
                res.render("perfil/admin/PagesAdmin/Restaurant/aproveRestaurant", {restaurants: restaurants});
            } else {
                console.log("Não existem restaurantes para aprovar.")
            }
        })
        .catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Restaurantes"});
        });   
};

//Admin aprovar um restaurante
restaurantController.aproveRestaurant = async function(req, res) {
    try {
        await Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
            $set: {
                aprove: true,
            },
        }, { new: true });

        console.log("Restuarante aprovado com sucesso");
        res.redirect("/perfil/admin/listRestaurants/aprove");
    } catch (err) {

    }
};

//Depois apagar pastas
restaurantController.rejectRestaurant = async function(req, res) {
    try {
        await Restaurant.deleteOne({ _id: req.params.restaurantId})
        console.log("Restuarante aprovado com sucesso");
        res.redirect("/perfil/admin/listRestaurants/aprove");
    } catch (err) {

    }
};

restaurantController.rejectRestaurant = async function(req, res) {
    
};

module.exports = restaurantController;