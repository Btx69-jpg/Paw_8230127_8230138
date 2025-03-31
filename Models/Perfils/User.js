var mongoose = require('mongoose');
var Address = require("./Reusable/Address");
//var Perfil = require("./Reusable/Perfil") (Conta)
/*
Nota: No codigo tenho de criar uma verificação que me garante que um email que estou a introduzir, já não esteja registado, se sim
Tem de aparecer mensagem de erro a dizer que conta com aquele email já existe
Nota: No match /^ começa o match e $/ termina o match
Utilizamos o id default do Mongo, se depois der asneira 
*/
var UserSchema = new mongoose.Schema({
    //codigo: Number (Variavel autoIncrement)
    firstName: {
        type: String,
        maxlength: [50, 'O primeiro nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    lastName: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], //Garante que o nome só tem letras e espaços
        require
    },
    //AddressPredifinido (Morada predifinida)
    countAddress: {
        type: Number,
        minvalue: [0, 'O valor minimo do contador é 0'],
        require
    },
    //address, ver como faço para reutilizar o que foi criado (Meter como array)
    birthdate: {
        type: Date,
    },
    //Perfil (conta inclui email, passwor, level e historico de encomendas)
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/]
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);