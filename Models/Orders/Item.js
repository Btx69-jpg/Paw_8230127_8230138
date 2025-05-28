var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    //O id do restaurante de onde pertence o item
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'    
    },
    //O id do menu que possui o prato
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
    },
    //o caminho para a foto do prato
    photo: {
        type: String,
        default: "",
    },
    //O nome do prato
    item: {
        type: String,
        maxlength: [100, 'O nome do item deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], 
        required: true,
    },
    portion: {
        type: String,
        maxlength: [25, 'a porção deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], 
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
        required: true,
    },    
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', ItemSchema);