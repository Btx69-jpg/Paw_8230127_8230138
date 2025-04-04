var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require('passport');

var Restaurant = require("../Models/Perfils/Restaurant");
var Address = require("../Models/Reusable/Address");
var Perfil = require("../Models/Reusable/Perfil");
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
*/
//Meter verificação para não deixar adicionar mais que 15 restaurantes
restaurantsController.saveRestaurant = async (req, res) => {
    try {
        // Obtém todos os restaurantes
        const restaurants = await Restaurant.find({}).exec();

        // Verifica se o limite de restaurantes foi atingido
        if (restaurants.length >= 15) {
            return res.status(500).send("Não é possivel criar mais restaurantes");
        }

        if(req.body.password !== req.body.confirmPassword) { 
            return res.status(500).send("As passwords não coincidem");
        }

        let find = false;
        let i = 0;
        let problem = "";

        // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
        while (i < restaurants.length && !find) {
            if (restaurants[i].name === req.body.name) {
                problem = "Já existe um restaurante com esse nome";
                find = true;
            } else if (restaurants[i].nif === req.body.nif) {
                problem = "Já existe um restaurante com esse NIF";
                find = true;
            } else if (restaurants[i].perfil.email === req.body.email) {
                problem = "Já existe um restaurante com esse email";
                find = true;
            } else if (restaurants[i].perfil.phoneNumber === req.body.phoneNumber) {
                problem = "Já existe um restaurante com esse numero telefonico";
                find = true;
            }
            i++;
        }

        if (find) {
            return res.status(500).send(problem);
        }

        // Encriptar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Cria um novo restaurante com os dados fornecidos
        let restaurant = new Restaurant({
            name: req.body.name,
            perfil: new Perfil({
                perfilPhoto: req.body.perfilPhoto,
                email: req.body.email,
                password: hashedPassword,
                phoneNumber: req.body.phoneNumber,
                countOrders: 0,
                historicOrders: [],
                priority: "Restaurant",
            }),
            sigla: req.body.sigla,
            nif: req.body.nif, 
            address: new Address({
                address: req.body.address,
                postal_code: req.body.postal_code,
                city: req.body.city
            }),
            description: req.body.description
        });

        console.log("Restaurante: ", restaurant);

        // Salva o restaurante no banco de dados
        await restaurant.save();

        console.log("Restaurante guardado com sucesso");
        res.redirect("/restaurants");
    } catch (error) {
        console.log("Error", error);
        res.render("restaurants/crudRestaurantes/addRestaurant");
    }
};

/*  Employee.remove({_id: req.params.id}, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Employee deleted!");
      res.redirect("/employees")
    }
  }); */

restaurantsController.removeRestaurant = async (req, res) => {
    try {
        await Restaurant.deleteOne({ _id: req.params.restaurantId });
        console.log("Restaurante eliminado!");
        res.redirect("/restaurants");
    } catch (error) {
        console.log("Error", error);
        res.status(500).send("Problema a apagar o restaurante");
    }
};
/*Meter codigo, para adicionar, editar e apagar */

module.exports = restaurantsController;