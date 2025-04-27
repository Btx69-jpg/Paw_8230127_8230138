var mongoose = require("mongoose");

var Restaurant = require("../../Models/Perfils/Restaurant");

//Metodos
const { deletePackage } = require('../Functions/crudPackage');
const User = require("../../Models/Perfils/User");
var aprovacaoRestController = {};

aprovacaoRestController.aprovePage = async function(req, res) {
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
            res.status(500).render("errors/error", {numError: 500, error: "Problema a procurar pelos Restaurantes"});
        });   
};

//Função que verifica se existem restaurantes para aprovar
//Se existir devolve true, se não existir devolve false
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

aprovacaoRestController.existsRestaurantsDesaprove = existsRestaurantsDesaprove;

//Função que verifica se o restaurante existe e se tem um user associado
function existRestaurant(restaurant) {
    let problem = "";

    if (!restaurant) {
        problem= "O restaurante não existe";
    } else if (!restaurant.tempUserId) {
        problem = "O restaurante não possui nenhum dono";
    }

    return problem;
}

//Admin aprovar um restaurante
aprovacaoRestController.aproveRestaurant = async function(req, res) {
    try {
        let restaurant = await Restaurant.findOne({ _id: req.params.restaurantId}).exec();

        let problemRest = existRestaurant(restaurant);
        if (problemRest !== "") {
            return res.redirect("/perfil/admin/listRestaurants");
        }
  
        const tempUserId = restaurant.tempUserId;

        let user = await User.findOne({ _id: tempUserId}).exec();

        if (!user) {
            console.log("O user associado ao restaurante não existe");
            return res.redirect("/perfil/admin/listRestaurants");
        }

        //Se esse user existe, atualizar a prioridade para dono e adicionar o id do restaurante ao array de restaurantes
        if (user.perfil.priority !== "Dono") {
            user.perfil.priority = "Dono";
            user.perfil.restaurantIds = [];
        }

        user.perfil.restaurantIds.push(restaurant._id);

        await user.save();
        console.log("Estatutos do user atualizados com sucesso");
        
        //A seguir de atualizar o user atualizamos o restaurante
        restaurant.perfil.ownersIds.push(tempUserId);
        restaurant.tempUserId = undefined;
        restaurant.aprove = true;

        await restaurant.save();
        console.log("Restaruante adicionado com sucesso");
        existsRestaurantsDesaprove()
            .then(exists => {
                if (exists) {
                    res.redirect("/perfil/admin/listRestaurants/aproves");
                } else {
                    res.redirect("/perfil/admin/listRestaurants");
                }
            });

    } catch (error) {
        console.log("Erro: ", error);
        res.redirect("/perfil/admin/listRestaurants");
    }
};

aprovacaoRestController.rejectRestaurant = function(req, res) {
    Restaurant.findByIdAndDelete(req.params.restaurantId)
        .then(deletedRestaurant => {
            if (!deletedRestaurant) {
                console.log("Restaurante não encontrado");
                res.stauts(404).redirect("/perfil/admin/listRestaurants/aproves");
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

module.exports = aprovacaoRestController;