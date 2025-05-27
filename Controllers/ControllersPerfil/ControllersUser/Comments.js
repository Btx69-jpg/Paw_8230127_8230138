var mongoose = require("mongoose");

//Models
const User = require("../../../Models/Perfils/User.js");
const Restaurant = require("../../../Models/Perfils/Restaurant.js");

const { deleteImage } = require("../../Functions/crudImagesRest");
//Controllers
var commentController = {};

/**
 * * Permite criar um comentario
 * 
 * TODO: Meter para meter também a foto.
 * TODO: Testar
 */
commentController.createComment = async function(req, res) {
    try {
        const userId = req.params.userId;
        const { orderId, comment } = req.body;

        let pathImg = req.file?.path || '';

        if (pathImg) {
            pathImg = "/" + pathImg.replace(/^public[\\/]/, "");
        }

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'perfil.historicOrders._id': orderId,
                'perfil.historicOrders.type': 'pickup',
            },
            {
                $set: {
                    'perfil.historicOrders.$.comment': comment,
                    'perfil.historicOrders.$.commentPhoto': pathImg
                }
            },
            {
                new: true
            }
        );
        
        const updatedOrder = updatedUser.perfil.historicOrders.find(o => o._id.toString() === orderId);

        if (!updatedOrder) {
            return res.status(404).json({ error: "Utilizador ou encomenda não encontrados" });
        }

        console.log(updatedOrder);

        await Restaurant.updateOne(
            { 
                name: updatedOrder.restaurant.name, 
                'perfil.email': updatedOrder.restaurant.email,
                'perfil.phoneNumber': updatedOrder.restaurant.phoneNumber,
                'perfil.historicOrders._id': orderId,
                'perfil.historicOrders.type': 'pickup',
            },
            { 
                $set: { 
                    'perfil.historicOrders.$.comment': comment,
                    'perfil.historicOrders.$.commentPhoto': pathImg
                } 
            }
        ).exec();

        return res.status(200).json();
    } catch(error) {
        console.error(error);
        res.status(500).json({error: error});;
    }
}

commentController.deleteComment = async function(req, res) {
    try {
        console.log("Deletfgs<,m adflkçsAFNÇKFSNÇLe")
        const userId = req.params.userId;
        const orderId = req.params.orderId;

        let pathImg = req.file?.path || '';

        if (pathImg) {
            pathImg = "/" + pathImg.replace(/^public[\\/]/, "");
        }

        const userBeforeDelete = await User.findOneAndUpdate(
            {
                _id: userId,
                'perfil.historicOrders._id': orderId,
                'perfil.historicOrders.type': 'pickup'
            },
            {
                $pull: {
                'perfil.historicOrders': { _id: orderId }
                }
            },
            {
                returnDocument: 'before' // devolve o documento antes de deletar
            }
        );
        
        const deletedOrder = userBeforeDelete.perfil.historicOrders.find(o => o._id.toString() === orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: "Utilizador ou encomenda não encontrados" });
        }

        await Restaurant.deleteOne(
            { 
                name: deletedOrder .restaurant.name, 
                'perfil.email': deletedOrder .restaurant.email,
                'perfil.phoneNumber': deletedOrder .restaurant.phoneNumber,
                'perfil.historicOrders._id': orderId,
                'perfil.historicOrders.type': 'pickup',
            },
            { 
                $set: { 
                    'perfil.historicOrders.$.comment': comment,
                    'perfil.historicOrders.$.commentPhoto': pathImg
                } 
            }
        ).exec();

        const imagePath = deletedOrder.commentPhoto;
        
        if(imagePath !== "") {
            const deletePath = "public" + imagePath;
            deleteImage(deletePath);
        }
       
        return res.status(200).json();
    } catch (error) {

    }
}


module.exports = commentController;