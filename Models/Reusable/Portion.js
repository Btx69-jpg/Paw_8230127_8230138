var mongoose = require('mongoose');

var PortionSchema = new mongoose.Schema({

portion: {
    type: String,
    maxlength: [25, 'O nome deve ter no máximo 50 caracteres'],
    match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], //Garante que o nome só tem letras, com acentos ou não, e espaços
    default: "",
    required: true,
},

updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Portion', PortionSchema);
