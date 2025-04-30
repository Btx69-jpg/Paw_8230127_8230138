var mongoose = require('mongoose');
var AddressOrder = require("../Orders/AddressOrder");
var Perfil = require("./Perfil");
const Order = require('../Orders/Order');

// Faz com que os schemas destes documentos fique embutido no documento. 

var UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: [50, 'O primeiro nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    lastName: {
        type: String,
        max: [50, 'O ultimo nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },  
    perfil: {
        type: Perfil.schema,
        required: true,
    },
    addresses: {
        type: [AddressOrder.schema],
        default: [] //Inicializa com o array vazio
    },  
    cart: {
        type: [Order.schema],
        default: [], // Inicializa com um array vazio
    },
    birthdate: {
        type: Date,
        min: ['1900-01-01', 'A data mínima é 1900-01-01'],
        max: [new Date(), 'A data máxima é a data atual'],
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);