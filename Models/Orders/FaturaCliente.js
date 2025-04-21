var mongoose = require('mongoose');

var FaturaClienteSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: [50, 'O primeiro nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], 
        required: true,
    },
    lastName: {
        type: String,
        max: [50, 'O ultimo nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'],
        required: true,
    },    
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/],
        required: true,
    },
    email:{
        type: String,
        match: [/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/, 'Formato inválido para o email'],
        maxlength: 50,
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FaturaCliente', FaturaClienteSchema);