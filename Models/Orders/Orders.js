var mongoose = require('mongoose');
//var Item = require('./Item'); //Pratos do menu
//var Cliente = require('../Perfils/User') (Ou criar um com dados base ou no array, guardar apenas o necessário do cliente)
//var Address = require('../Perfils/Reusable')
var ItemSchema = new mongoose.Schema({
    //Nom da encomenda
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    //Cliente (Cliente que vai receber a encomenda)
    //address (morada da encomenda, a que o cliente selecionou na encomenda ou inseriou)
    countItems: {
        type: Number,
        minlength: [0, 'A Encomenda, necessita no minimo de 0 order'] //Ver se era melhor meter um já que o outro campo é obrigatorio
    },
    //Itens (Array, dos Itens da encomenda, meter um minimo de 1 aqui)
    totEncomenda: {
        type: Number,
        minlength: [0, 'O valor mínimo da encomenda deve ser 0']
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', ItemSchema);