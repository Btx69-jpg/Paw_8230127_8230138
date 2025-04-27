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
        
            let aut = false;
                
            if(req.cookies && req.cookies.priority) {
                const priority = req.cookies.priority;
                if(priority === "Admin") {
                    aut = true;
                } else if(priority === "Dono") {
                    const restDono = await Restaurant.findOne({
                        name: req.params.restaurant,
                        _id: { $in: res.locals.user.perfil.restaurantIds }
                    }).exec();    
            
                    if(restDono) {
                        aut = true;
                    }
                }
            }
            
            return res.render("restaurants/restaurant/homepage",{ restaurant, menus, filters: {}, categories, aut: aut });
        })
        .catch(error => {
            console.error(error);
            res.status(500).render("index");
        });
}

module.exports = indexController;