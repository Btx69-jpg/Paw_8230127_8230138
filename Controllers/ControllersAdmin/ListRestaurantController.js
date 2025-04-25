var mongoose = require("mongoose");

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");
const User = require("../../Models/Perfils/User");

var listRestaurantController = {};

listRestaurantController.homePage = function(req, res) {
    Restaurant.find({ aprove: true}).exec()
        .then(restaurants => {

            Restaurant.findOne( {aprove: false} ).exec()
                .then(restaruantDesaprove => {

                    let desaprove = false;
                    if(restaruantDesaprove !== null) {
                        desaprove = true;
                    }

                    res.render("perfil/admin/PagesAdmin/Restaurant/listRestaurants", {restaurants: restaurants, filters: {}, desaprove: desaprove});
                }).catch(err => {
                    console.log("Error", err);
                    res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar pelos Restaurantes"});
                }); 
            
        }).catch(function(err) {
            console.log("Error", err);
            res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar pelos Restaurantes"});
        });   
};

listRestaurantController.showRestaurant = async function(req, res) {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId).exec();
        if (restaurant) {
            let owners = []

            if(restaurant.perfil.ownersIds) {
                owners = await User.find( {_id: {$in: restaurant.perfil.ownersIds } }).exec()
            }

            res.render("perfil/admin/PagesAdmin/Restaurant/showRestaurant", { restaurant: restaurant, owners: owners});
        } else {
            console.log("O restaurant não existe não existe")
            res.status(404).render(res.locals.previousPage);
        }
    } catch(error) {
        console.log("Error: ", error)
        res.status(404).render(res.locals.previousPage);
    }
}

module.exports = listRestaurantController;