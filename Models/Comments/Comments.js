var mongoose = require('mongoose');
var Comment = require('./Comment'); //Comentarios

//Faz com que os schemas destes documentos fique embutido no documento.
var CommentSchema = Comment.schema; 

var CommentsSchema = new mongoose.Schema({
    countComments: {
        type: Number,
        default: 0,
        min: [0, 'O número mínimo de comentários é 0'],
        required: true,
    },
    comments: {
        type: [CommentSchema],
        default: [], //Inicializa com o array vazio
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comments', CommentsSchema);