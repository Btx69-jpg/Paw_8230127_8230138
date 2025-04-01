var mongoose = require('mongoose');
var AddressOrder = require("../Reusable/AddressOrder");
var Perfil = require("../Reusable/Perfil")

// Faz com que os schemas destes documentos fique embutido no documento. 
var AddressOrderSchema = AddressOrder.schema;
var PerfilSchema = Perfil.schema;

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
        type: PerfilSchema,
        required: true,
    },
    countAddress: {
        type: Number,
        min: [0, 'O valor minimo do contador é 0'],
        required: true,
    },
    addresses: {
        type: [AddressOrderSchema],
        default: [] //Inicializa com o array vazio
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