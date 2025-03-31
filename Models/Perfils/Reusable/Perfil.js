var mongoose = require('mongoose');
//var Orders = require("./Order") (Encomendas) //Ver depois a pasta
/*
Talvez vai ter aqui também um array de encomendas, para o historico de encomendas de ambos
*/
var PerfilSchema = new mongoose.Schema({
    email:{
        type: String,
        //Garante o formato correto do email (Validar nos slides de PEI se está bem o match)
        match: [/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/, 'Formato inválido para o nome'], 
        require
    },
    password: {
        type: String,
        require
    },
    leverCount: {
        type: Number,
        minvalue : [1, 'O nível não pode ser negativo ou nulo'],
        maxvalue: [5, 'O nível não pode ser superior que 5'],
        require
    },
    countOrders: {
        type: Number,
        minvalue: [0, 'O numero minimo de encomendas é 0'],
        require
    },
    //Orders (historico de encomendas)
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfil', PerfilSchema);
