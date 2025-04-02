var mongoose = require('mongoose');
var Category = require('../Reusable/Category');

var DishSchema = new mongoose.Schema({
    photo: {
        type: String,
    },
    name: {
        type: String,
        maxlength: [50, 'O título deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    description: {
        type: String,
        maxlength: [250, 'A descrição deve ter no máximo 200 caracteres'],
        required: true,
    },
    category: {
        type: Category.schema, 
        required: true,
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'O preço mínimo é 0'],
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dish', DishSchema);