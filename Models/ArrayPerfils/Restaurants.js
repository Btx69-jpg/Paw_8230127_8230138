var mongoose = require('mongoose');
var Restaurant = require('../Perfils/Restaurant'); //Pratos do menu

//Faz com que os schemas destes documentos fique embutido no documento.
var RestaurantSchema = Restaurant.schema; 

var RestaurantsSchema = new mongoose.Schema({
    countRestaurant: {
        type: Number,
        default: 1,
        min: [1, 'O minimo de pratos são 1'],
        max: [10, 'O máximo de pratos do menu são 10'],
        required: true,
    },
    users: { 
        type: [RestaurantSchema], 
        default: [], 
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurants', RestaurantsSchema);