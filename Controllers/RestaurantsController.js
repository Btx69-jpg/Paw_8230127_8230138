var mongoose = require("mongoose");
//Esta segunda linha, carrega o formato definido no modelo, mas especificamente o modelo dos Employee
//var Restaurants = require("../Models/ArrayPerfils/Restaurants");
var Restaurant = require("../Models/Perfils/Restaurant");
var Address = require("../Models/Reusable/Address");
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

/*
Falta adicionar a foto do restaurante!!!!
Meter verificação para não deixar introduzir doi restaurantes iguais
E dois restaurantes com o mesmo nif e talvez com o mesmo nome
*/
//Meter verificação para não deixar adicionar mais que 15 restaurantes
restaurantsController.saveRestaurant = function(req, res) {
    Restaurant.find({}).exec()
        .then(totRestaurants => {
            if(totRestaurants.length >= 15) {
                return res.status(500).send("Não é possivel criar mais restaurantes");
            }
            
            let restaurant = new Restaurant({
                name: req.body.name,
                perfil: new Perfil({
                    perfilPhoto: req.body.perfilPhoto,
                    email: req.body.email,
                    password: req.body.password,
                    countOrders: 0,
                    historicOrders: [],
                    priority: "Restaurant",
                }),
                sigla: req.body.sigla,
                nif: req.body.nif,
                phoneNumber: req.body.phone_number,
                email: req.body.email,
                address: new Address({
                    address: req.body.address,
                    postal_code: req.body.postal_code,
                    city: req.body.city
                }),
                description: req.body.description
            });
            
            console.log("Restaurante: ", restaurant);
            return restaurant.save();
        })
        .then(() => {
            console.log("Restaurante guardado com sucesso");
            res.redirect("/restaurants");
        })
        .catch(err => {
            console.log(err);
            res.render("restaurants/crudRestaurantes/addRestaurant");
        });
}

/*Meter codigo, para adicionar, editar e apagar */

module.exports = restaurantsController;