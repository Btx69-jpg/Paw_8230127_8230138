var mongoose = require('mongoose');
//Talvez mudar a categoria para ref
var DishSchema = new mongoose.Schema({
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
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        default: {},
        required: true,
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'O preço mínimo é 0'],
        required: true,
    },
    photo: {
        type: String,
        default: "",
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dish', DishSchema);