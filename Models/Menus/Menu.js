var mongoose = require('mongoose');
//var Dish = require('./Dish'); //Pratos do menu

var MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    countDish: {
        type: Number,
        minvalue: [0, 'O minimo de pratos são 0'],
        maxvalue: [10, 'O máximo de pratos do menu são 10'],
        require
    },
    //dishs (variavel para guardar os pratos, deve ser um array, obrigatorio)
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Address', AddressSchema);