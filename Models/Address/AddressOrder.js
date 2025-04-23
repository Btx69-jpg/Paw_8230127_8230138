var mongoose = require('mongoose');
var Address = require("./Address");

var AddressOrderSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    address: {
        type: Address.schema,
        required: true,
    },
    nif: {
        type: Number,
        match: [/^[0-9]{9}$/, 'O Nif deve conter exatamente 9 caracteres']
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AddressOrder', AddressOrderSchema);