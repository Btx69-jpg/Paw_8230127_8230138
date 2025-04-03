var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
//var Restaurants = require("../Models/ArrayPerfils/Restaurants");
var Restaurant = require("../Models/Perfils/Restaurant")
var restaurantsController = {};
const totRestaurant = 15

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
//Preciso de no render mandar também os employees
restaurantsController.restaurantsPage = function(req, res) {
    Restaurant.find({}).exec().then(function(restaurants) {
        res.render("restaurants/restaurants", {restaurants: restaurants});
    }).catch(function(err) {
        console.log("Error", err);
    res.status(500).send("Problema a procurar pelos pratos do menu");
    });
};

restaurantsController.createRestaurant = function(req, res) {
    res.render('restaurants/crudRestaurantes/addRestaurant');
};

//Meter verificação para não deixar adicionar mais que 15 restaurantes
restaurantsController.saveRestaurant = function(req, res) {
    
    //Posso meter como variavel global
    let totRestaurant = Restaurant.find({}).exec();

    if(totRestaurant >= 15) {
        res.status(500).send("Não é possivel criar mais restaurantes");
    } else {
        let restaurant = new Restaurant( {
            name: req.body.name,
            sigla: req.body.sigla,
            nif: req.body.nif,
            phone_number: req.body.phone_number,
            address: new Address({
                address: req.body.address,
                postal_code: req.body.postal_code,
                city: req.body.city
            }),
            description: req.body.description
        });
        restaurant.save(function(err) {
            if(err) {
                console.log(err);
                res.render("restaurants/crudRestaurantes/addRestaurant");
            } else {
                console.log("Prato guardado com sucesso");
                //Depois criar esse caminho
                res.redirect("/restaurants/restaurant/homepage/" + restaurant.name);
            }
        });
    }

    /*Preciso de depois buscar o array de restaurantes e meter-lhe este restaurante,
    e caso não tenha nenhum registo cria-lo
    Ou então não nem é preciso o array de restaurante a collection de restaurante já serve.
    */
}

/*Meter codigo, para adicionar, editar e apagar */

module.exports = restaurantsController;