var mongoose = require("mongoose");

var Restaurant = require("../Models/Perfils/Restaurant");
var Users = require("../Models/Perfils/User");
var Category = require("../Models/Reusable/Category");
var adminController = {};


adminController.homePage = async function(req, res) {
    res.render("perfil/admin/adminPage");
};

adminController.listRestaurants = function(req, res) {
    Restaurant.find({}).exec()
        .then(function(restaurants) {
            res.render("perfil/admin/PagesAdmin/listRestaurants", {restaurants: restaurants});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).send("Problema a procurar pelos Restaurantes");
        });  
};

adminController.listUsers = function(req, res) {
    //Está mal o filtro
    Users.find({ 'perfil.priority': "Cliente"}).exec()
        .then(function(users) {
            res.render("perfil/admin/PagesAdmin/listUsers", {users: users});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).send("Problema a procurar pelos Restaurantes");
        });  
};

adminController.listCategories = function(req, res) {
    Category.find({}).exec()
        .then(function(categories) {
            res.render("perfil/admin/PagesAdmin/listCategories", {categories: categories});
        })
        .catch(function(err) {
            console.log("Error", err);
            res.status(500).send("Problema a procurar pelos Restaurantes");
        });  
};

module.exports = adminController;