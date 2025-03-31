var mongoose = require('mongoose');
//var Dish = require('../Menus/Dish'); //Pratos do menu

var ItemSchema = new mongoose.Schema({
    //Nome da Dish, talvez guardar também o id
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    quantity: {
        type: Number,
        minValue: [1, 'Numero mínimo de pratos selecionados é 1'],
        maxValue: [20, 'Numero máximo de pratos'],
        require
    },
    //Quantidade * Preço (Não é require, porque só após inserir é que posso calcular)
    price: {
        type: Number,
        minValue: [0, 'O preço minimo é 0€']
    },
    //dishs (variavel para guardar os pratos, deve ser um array, obrigatorio)
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', ItemSchema);