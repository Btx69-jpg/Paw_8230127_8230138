var mongoose = require('mongoose');
var Dish = require('./Dish'); //Pratos do menu
//var Category = require('../Reusable/Category');

var MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    dishes: { 
        type: [Dish.schema], 
        default: [], 
        required: true,
    },
    type: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Menu', MenuSchema);