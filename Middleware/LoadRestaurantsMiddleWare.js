var mongoose = require("mongoose");
const Restaurant = require("../Models/Perfils/Restaurant");

//alterar posteriormente para implementar a logica de escolha dos restaurantes e que a pagina inicial carregue antes se quer de receber os restaurantes para não demorar
getRestaurants = async function(req, res, next) {
    try {
        const restaurants = await Restaurant.find({ aprove: true }).limit(3).exec();
        res.locals.restaurants = restaurants;
    } catch (error) {
        res.locals.restaurants = [];
    }
    next();
}
module.exports = getRestaurants;
