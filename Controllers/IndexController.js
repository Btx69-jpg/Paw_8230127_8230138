var mongoose = require("mongoose");
var indexController = {};

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

//Metodos
const {carregarCategoriesMenus} = require("./Functions/categories.js");

indexController.indexPage = function(req, res) {
    res.render('index');
}

indexController.search = function(req, res) {
    Restaurant.findOne({ name: req.query.restaurantName }).exec()
        .then(async restaurant => {
            if (!restaurant) {
                return res.status(404).render("index");
            }
        
            const menus = restaurant.menus;
            const categories = await carregarCategoriesMenus(menus);
        
            return res.render("restaurants/restaurant/homepage",{ restaurant, menus, filters: {}, categories });
        })
        .catch(error => {
            console.error(error);
            res.status(500).render("index");
        });
}

module.exports = indexController;