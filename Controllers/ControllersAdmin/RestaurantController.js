var mongoose = require("mongoose");

var Restaurant = require("../../Models/Perfils/Restaurant");

//Metodos
const { deletePackage } = require('../Functions/crudPackage');
var restaurantController = {};

restaurantController.homePage = function(req, res) {
    Restaurant.find({ aprove: true}).exec()
        .then(restaurants => {

            Restaurant.findOne( {aprove: false} ).exec()
                .then(restaruantDesaprove => {

                    let desaprove = false;
                    if(restaruantDesaprove !== null) {
                        desaprove = true;
                    }

                    res.render("perfil/admin/PagesAdmin/Restaurant/listRestaurants", {restaurants: restaurants, desaprove: desaprove});
                }).catch(err => {
                    console.log("Error", err);
                    res.render('errors/error500', {error: "Problema a procurar pelos Restaurantes"});
                }); 
            
        }).catch(function(err) {
            console.log("Error", err);
            res.render('errors/error500', {error: "Problema a procurar pelos Restaurantes"});
        });   
};

restaurantController.search = function(req, res) {
    let query = {};
    const restaurant = req.query.name;
    const city = req.query.city;
    
    query.aprove = true;

    if (restaurant) {
        query.name = restaurant;
    }
    
    if (city) {
        query["address.city"] = city;
    }
    
    Restaurant.find(query).exec()
        .then(function (restaurants) {
            
            existsRestaurantsDesaprove()
                .then(exists => {
                    res.render("perfil/admin/PagesAdmin/Restaurant/listRestaurants", {restaurants: restaurants, desaprove: exists});
                });
        })
        .catch(function(err) {
            console.error("Erro ao filtrar pelos restuarantes: ", err);
            res.render("errors/error500", {error: err});
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

//Retornar uma p
function existsRestaurantsDesaprove() {
    return Restaurant.findOne({ aprove: false }).exec()
        .then(rest => {
            let find = false;
            if(rest !== null) {
                find = true;
            }
            return find;
        })
        .catch(error => {
            console.log("Error: ", error);
            return false;
        });
}

//Admin aprovar um restaurante
restaurantController.aproveRestaurant = function(req, res) {
    Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
        $set: {
            aprove: true,
        },
    }, { new: true }).exec()
        .then(rest => {
            console.log("Restuarante aprovado com sucesso");
        
            existsRestaurantsDesaprove()
                .then(exists => {
                    if (exists) {
                        res.redirect("/perfil/admin/listRestaurants/aproves");
                    } else {
                        res.redirect("/perfil/admin/listRestaurants");
                    }
                });
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.redirect("/perfil/admin/listRestaurants");
        });
};

/*Tentar só arrnajar uma forma melhor de referenciar o caminho
da pasta, tentar retirar o /images/Restaurants, pois é texto e já 
está escrito na variavel e pode ser desnecessario.
*/
restaurantController.rejectRestaurant = function(req, res) {
    Restaurant.findByIdAndDelete(req.params.restaurantId)
        .then(deletedRestaurant => {
            if (!deletedRestaurant) {
                console.log("Restaurante não encontrado");
                res.redirect("/perfil/admin/listRestaurants/aproves");
            } else {
                deletePackage(`public/images/Restaurants/${deletedRestaurant.name}/`);
                
                existsRestaurantsDesaprove()
                    .then(exists => {
                        if (exists) {
                            res.redirect("/perfil/admin/listRestaurants/aproves");
                        } else {
                            res.redirect("/perfil/admin/listRestaurants");
                        }
                    })
                    .catch(error => {
                        console.log("Erro no existsRestaurantsDesaprove: ", error);
                        res.redirect("/perfil/admin/listRestaurants/aproves");
                    });
            }
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.redirect("/perfil/admin/listRestaurants/aproves");
        });
};

module.exports = restaurantController;