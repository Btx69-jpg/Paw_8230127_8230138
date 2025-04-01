var mongoose = require('mongoose');
var Order = require('../Orders/Order'); //Carrinho de compras
var Perfil = require('../Perfils/Reusable/Perfil'); //Perfil do utilizador

var OrderSchema = Order.schema; 

var CommentSchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: [50, 'O título deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    description: {
        type: String,
        maxlength: [250, 'A descrição deve ter no máximo 250 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para a descrição'], //Garante que a descrição só tem letras e espaços
        required: true,
    },
    photo: {
        type: String,
    },
    numberStars: {
        type: Number,
        default: 0,
        min: [0, 'O mínimo de estrelas é 0'],
        max: [5, 'O máximo de estrelas é 5'],
        required: true,
    },
    order: {
        type: OrderSchema,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Perfil', //Referência ao modelo de Perfil (Depois tenho de usar o metodo populate para ir buscar o user)
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);