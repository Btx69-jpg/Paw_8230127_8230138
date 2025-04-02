var mongoose = require('mongoose');
var Dish = require('../Menus/Dish'); //Pratos

var ItemSchema = new mongoose.Schema({
    dish: {
        type: Dish.schema,
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Numero mínimo de pratos selecionados é 1'],
        max: [20, 'Numero máximo de pratos'],
        required: true,
    },
    //Quantidade * Preço (Não é require, porque só após inserir é que posso calcular)
    price: {
        type: Number,
        default: 0,
        min: [0, 'O preço minimo é 0€'],
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', ItemSchema);