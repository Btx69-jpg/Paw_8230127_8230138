var mongoose = require("mongoose");
var indexController = {};

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

//Metodos
const {carregarCategoriesMenus} = require("./Functions/categories.js");

indexController.indexPage = async function(req, res) {
    res.render('index', {restaurants: res.locals.restaurants});
}

indexController.search = function(req, res) {
    query = {};
    const nameRest = req.query.restaurantName;

    if(nameRest) {
        query.name = { $regex: nameRest, $options: 'i' };
    }

    Restaurant.find(query).exec()
        .then(async restaurants => {
            if (!restaurants || restaurants.length === 0) {
                console.log("Não existem restaurantes com esse nome");
                return res.status(404).render("index", {restaurants: res.locals.restaurants});
            }

            console.log("Restaurantes encontrados: ", restaurants.length);

            if (restaurants.length > 1) {
                let autRemoveEdit = [];

                if (req.cookies && req.cookies.priority && req.cookies.priority === "Dono") {
                    const user = res.locals.user;
                    const ids = user.perfil.restaurantIds.map(_id => _id.toString());
                
                    for (let j = 0; j < restaurants.length; j++) {
                        const rId = restaurants[j]._id.toString();
                        autRemoveEdit[j] = ids.includes(rId);
                    }
                }
                
                res.render("restaurants/restaurants", {restaurants: restaurants, filters: {}, autRemoveEdit: autRemoveEdit}); 
            } else {
                const restaurant = restaurants[0];
                const menus = restaurant.menus;
                const categories = await carregarCategoriesMenus(menus);
                let autEdit = false;
                let autGest = false;
            
                if (req.cookies && req.cookies.priority) {
                    const priority = req.cookies.priority;
                
                    if (priority === "Admin") {
                        autEdit = true;
                    } else if (priority === "Dono") {
                        let found = false;
                        let i = 0;
                        let restIds = res.locals.user.perfil.restaurantIds;
                        while (i < restIds.length && !found) {
                                if(restIds[i].toString() === restaurant._id.toString()) {
                                    found = true;
                                }
                                i++;
                            }
                    
                        if (found) {
                            autEdit = true;
                            autGest = true;
                        }
                    } else if (priority === "Restaurant" && restaurant._id.toString() === res.locals.user._id.toString()) {
                        autGest = true;
                    }
                }

                res.render("restaurants/restaurant/homepage", { restaurant: restaurant, menus: menus,
                    filters: {}, categories: categories, autEdit: autEdit, autGest: autGest});
            }
        
        })
        .catch(error => {
            console.error(error);
            res.status(500).render("index", {restaurants: res.locals.restaurants});
        });
}

module.exports = indexController;