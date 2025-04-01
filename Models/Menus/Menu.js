var mongoose = require('mongoose');
var Dish = require('./Dish'); //Pratos do menu

var MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    countDish: {
        type: Number,
        default: 1,
        min: [1, 'O minimo de pratos são 1'],
        max: [10, 'O máximo de pratos do menu são 10'],
        required: true,
    },
    dishes: { 
        type: [Dish.schema], 
        default: [], 
        required: true,
    },
    /*
    Pode ser opcional, se o utilizador escolher apenas o menu então obrigatorio, se escolher
    os pratos, então não é obrigatorio, e pode ser apagado.
    */
    price: {
        type: Number,
        default: 0,
        min: [0, 'O preço mínimo é 0'],
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Menu', MenuSchema);