var mongoose = require('mongoose');

var AddressSchema = new mongoose.Schema({
    street: {
        type: String,
        maxlength: [250, 'A morada deve ter no máximo 250 caracteres'],
        required: true,
    },
    postal_code: {
        type: String,
        match: [/^[0-9]{4}-[0-9]{3}$/, 'O codigo postal ele é formado por 4 numeros, de seguida um hifen e por fim mais 3 numeros, de 0 até 9' ], 
        required: true,
    }, 
    city: {
        type: String,
        maxlength: [100, 'O nome da cidade deve ter no máximo 100 caracteres'],
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Address', AddressSchema);