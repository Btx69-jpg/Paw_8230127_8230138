var mongoose = require("mongoose");

//Models
const Restaurant = require("../../../Models/Perfils/Restaurant");
const User = require("../../../Models/Perfils/User");

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
        const restaurantId = req.params.restaurantId
        const restaurant = await Restaurant.findOne({_id: restaurantId, aprove: false}).exec();
        
        if (!restaurant) {
            console.log("O restaurant não existe não existe")
            res.status(404).render(res.locals.previousPage);
        }
        
        let owners = []

        if (restaurant.perfil.ownersIds) {
            owners = await User.find( {_id: {$in: restaurant.perfil.ownersIds } }).exec()
        }

        let voltar = "";
        switch(res.locals.currentPage) {
            case `/perfil/admin/listRestaurants/showRest/${restaurantId}`: {
                voltar = "/perfil/admin/listRestaurants";
                break;
            } case `/perfil/admin/listRestaurants/aproves/showRestaurant/${restaurantId}`: {
                voltar = "/perfil/admin/listRestaurants/aproves";
                break;
            } default: {
                console.log("URL não existente");
                return res.status(404).redirect(res.locals.previousPage);
            }
        }

        res.render("perfil/admin/PagesAdmin/Restaurant/showRestaurant", { restaurant: restaurant, owners: owners, voltar: voltar});

    } catch(error) {
        console.log("Error: ", error)
        res.status(404).render(res.locals.previousPage);
    }
}

/**
 * Retorna de 1 a 3 restaurantes aleatórios, de acordo com o que existir na base.
 */
async function getRecommendedRestaurants() {
    const total = await Restaurant.countDocuments();  
    if (total === 0) return [];
  
    const size = Math.min(total, 3);
  
    const restaurants = await Restaurant.aggregate([
      { $sample: { size } }
    ]);
  
    return restaurants;
  }
  
module.exports = { getRecommendedRestaurants };

module.exports = listRestaurantController;