var mongoose = require("mongoose");
var indexController = {};

//Models
const Restaurant = require("../Models/Perfils/Restaurant");
const User = require("../Models/Perfils/User.js");

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

indexController.pageRestaurantes = async function(req, res) {
  try {
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");    
    console.log("");
    console.log("");
    console.log("");

    console.log("-------------------------");
    const userId = req.params.userId;
    let user = await User.findById(userId).exec();
    
    if (!user) {
        console.log("O utilizador não foi encontrado");
        return res.status(404).redirect("/");
    }

    if (!user.perfil) {
        console.log("O utilizador não possui nenhum perfil");
        return res.status(404).redirect("/");
    } 

    if (user.perfil.priority !== "Dono") {
        console.log("O utilizador não é nenhum dono");
        return res.status(302).redirect("/");
    }

    if (!user.perfil.restaurantIds) {
        console.log("O utilizador não é dono de nenhum restaurante");
        return res.status(302).redirect("/");
    }

    const restaurantes = await Restaurant.find({ _id: { $in: user.perfil.restaurantIds } }).exec();

    if(!restaurantes || restaurantes.length === 0) {
        console.log("Não foi encontrado nenhum restaurante, nenhum foi encontrado");
        return res.status(404).redirect("/");
    }

    console.log("Restaurantes: ", restaurantes);

    if (restaurantes.length === 1) {
        const restaurant = restaurantes[0]
        const menus = restaurant.menus;
        const categories = await carregarCategoriesMenus(menus);
        const autEdit = true;
        const autGest = true;
        res.render("restaurants/restaurant/homepage", { restaurant: restaurant, menus: menus, filters: {},
            categories: categories, autEdit: autEdit, autGest: autGest });
    } else {
        const autRemoveEdit = [];
        for (let i = 0; i < user.perfil.restaurantIds.length; i++) {
            autRemoveEdit[i] = true;
        }
        res.render("restaurants/restaurants", {restaurants: restaurantes, filters: {}, autRemoveEdit: autRemoveEdit });
    }
  } catch (error) {
    console.error("Error", error);
    res.status.json({error: error})
  }
};

module.exports = indexController;