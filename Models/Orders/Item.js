var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    item: {
        type: String,
        maxlength: [50, 'O título deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], //Garante que o nome só tem letras, com acentos ou não, e espaços
        required: true,
    },
    portion: {
        type: String,
        maxlength: [25, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], //Garante que o nome só tem letras, com acentos ou não, e espaços
        default: "",
        required: true,
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'O preço minimo é 0€'],
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Numero mínimo de pratos selecionados é 1'],
        max: [10, 'Numero máximo de pratos'],
        required: true,
    },
    //Quantidade * Preço (Não é require, porque só após inserir é que posso calcular)
    
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', ItemSchema);