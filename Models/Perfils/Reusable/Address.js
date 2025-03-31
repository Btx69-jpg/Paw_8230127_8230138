var mongoose = require('mongoose');

/*
Nota: No match /^ começa o match e $/ termina o match
Utilizamos o id default do Mongo, se depois der asneira 
*/
var AddressSchema = new mongoose.Schema({
    //codigo: Number (Variavel autoIncrement)
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    address: {
        type: String,
        maxlength: [250, 'A morada deve ter no máximo 250 caracteres'],
        require
    },
    postal_code: {
        type: String,
        //Garante o formato 0000-000, o correto para um codigo postal
        match: [/^[0-9]{4}-[0-9]{3}$/, 'O codigo postal ele é formado por 4 numeros, de seguida um hifen e por fim mais 3 numeros, de 0 até 9' ], 
        require
    }, 
    city: {
        type: String,
        maxlength: [100, 'O nome da cidade deve ter no máximo 100 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome da cidade só tem letras e espaços
        require
    },
    nif: {
        type: Number,
        match: [/^[0-9]{9}$/]
    },
    updated_at: { type: Date, default: Date.now },
});

//Codigo para meter uma variavel autoIncrement
//MoradaSchema.plugin(AutoIncrement, { inc_field: 'codigo' });
module.exports = mongoose.model('Address', AddressSchema);