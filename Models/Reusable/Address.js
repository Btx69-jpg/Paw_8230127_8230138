var mongoose = require('mongoose');

var AddressSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        required: true,
    },
    address: {
        type: String,
        maxlength: [250, 'A morada deve ter no máximo 250 caracteres'],
        required: true,
    },
    postal_code: {
        type: String,
        //Verifica o formato correto do codigo postal
        match: [/^[0-9]{4}-[0-9]{3}$/, 'O codigo postal ele é formado por 4 numeros, de seguida um hifen e por fim mais 3 numeros, de 0 até 9' ], 
        required: true,
    }, 
    city: {
        type: String,
        maxlength: [100, 'O nome da cidade deve ter no máximo 100 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para a cidade'],
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Address', AddressSchema);