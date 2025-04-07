var mongoose = require('mongoose');
var AddressOrder = require("../Reusable/AddressOrder");
var Perfil = require("../Reusable/Perfil");
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
    countAddress: {
        type: Number,
        default: 0,
        min: [0, 'O valor minimo do contador é 0'],
        max: [5, 'O número máximo de moradas é 5'],
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
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/, 'O número de telefone deve conter exatamente 9 digitos'],
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);