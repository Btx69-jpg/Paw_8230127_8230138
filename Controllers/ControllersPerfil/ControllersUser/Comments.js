var mongoose = require("mongoose");

//Models
const User = require("../../../Models/Perfils/User.js");
const Restaurant = require("../../../Models/Perfils/Restaurant.js");

//Controllers
var commentController = {};

//Funções
const { deleteImage } = require("../../Functions/crudImagesRest.js");

/**
 * * Permite criar um comentario
 */
commentController.createComment = async function(req, res) {
    try {
        const userId = req.params.userId;
        const { orderId, comment } = req.body;

        let pathImg = req.file?.path || '';

        if (pathImg) {
            pathImg = "/" + pathImg.replace(/^public[\\/]/, "");
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }
        
        const orderIndex = user.perfil.historicOrders.findIndex(o =>
            o._id.toString() === orderId && o.type === 'pickup'
        );

        if (orderIndex === -1) {
            return res.status(404).json({ error: "Encomenda não encontrada no utilizador" });
        }

        const updatedOrder = user.perfil.historicOrders[orderIndex];

        const restaurant = await Restaurant.findOne({
            name: updatedOrder.restaurant.name,
            'perfil.email': updatedOrder.restaurant.email,
            'perfil.phoneNumber': updatedOrder.restaurant.phoneNumber,
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurante não encontrado" });
        }

        const orderIndexRest = restaurant.perfil.historicOrders.findIndex(o =>
            o._id.toString() === orderId && o.type === 'pickup'
        );

        if (orderIndexRest === -1) {
            return res.status(404).json({ error: "Encomenda não encontrada no restaurante" });
        }

        restaurant.perfil.historicOrders[orderIndexRest].comment = comment;
        restaurant.perfil.historicOrders[orderIndexRest].commentPhoto = pathImg;
        await restaurant.save();

        user.perfil.historicOrders[orderIndex].comment = comment;
        user.perfil.historicOrders[orderIndex].commentPhoto = pathImg;
        await user.save();

        return res.status(200).json();
    } catch(error) {
        console.error(error);
        res.status(500).json({error: error});;
    }
}

function findOrder(orders, orderId) {
    let found = false;
    let i = 0;
    while(i < orders.length && !found) {
        if(orders[i]._id.toString() === orderId.toString()) {
            found = true;
        } else {
            i++;
        }
    }

    if (!found) {
        i = -1;
    }
    return i;
}

commentController.updateComment = async function(req, res) {
     try {
        const userId = req.params.userId;
        const { orderId, comment } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }

        const orderIndex = user.perfil.historicOrders.findIndex(o =>
            o._id.toString() === orderId && o.type === 'pickup'
        );

        if (orderIndex === -1) {
            return res.status(404).json({ error: "Encomenda não encontrada no utilizador" });
        }

        const updatedOrder = user.perfil.historicOrders[orderIndex];
        const imgUser = updatedOrder.commentPhoto;

        const restaurant = await Restaurant.findOne({
            name: updatedOrder.restaurant.name,
            'perfil.email': updatedOrder.restaurant.email,
            'perfil.phoneNumber': updatedOrder.restaurant.phoneNumber,
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurante não encontrado" });
        }

        const orderIndexRest = restaurant.perfil.historicOrders.findIndex(o =>
            o._id.toString() === orderId && o.type === 'pickup'
        );

        if (orderIndexRest === -1) {
            return res.status(404).json({ error: "Encomenda não encontrada no restaurante" });
        }

        let dif = false;

        let pathNewImg = req.file?.path || '';
        
        if(restaurant.perfil.historicOrders[orderIndexRest].comment !== comment) {
            restaurant.perfil.historicOrders[orderIndexRest].comment = comment;
            dif = true;
        }
       
        if(pathNewImg !== imgUser) {
            restaurant.perfil.historicOrders[orderIndexRest].commentPhoto = pathNewImg;
            pathNewImg = "/" + pathNewImg.replace(/^public[\\/]/, "");
            dif = true;
        }
       
        if(!dif) {
            return res.status(400).json({error: "Não houve alterações no comentario do utilizador"})
        }

        await restaurant.save();

        if(user.perfil.historicOrders[orderIndex].comment !== comment) {
            user.perfil.historicOrders[orderIndex].comment = comment;
        }
       
        if(pathNewImg !== imgUser) {
            user.perfil.historicOrders[orderIndex].commentPhoto = pathNewImg;
        }

        await user.save();

        //Remover Imagem antiga
        if (pathNewImg !== '' && imgUser !== pathNewImg) {
            const oldFilePath = "public" + imgUser;
            deleteImage(oldFilePath);
        }

        return res.status(200).json();
    } catch(error) {
        console.error(error);
        res.status(500).json({error: error});;
    }
}

/**
 * * Permite eliminar um comentario, feito por um utilizador
 */
commentController.deleteComment = async function(req, res) {
    try {
        const userId = req.params.userId;
        const orderId = req.params.orderId;

        let user = await User.findOne({
            _id: userId,
            'perfil.historicOrders._id': orderId,
            'perfil.historicOrders.type': 'pickup'
        });
        
        if (!user) {
            return res.status(404).json({ error: "Utilizador ou encomenda não encontrados" });
        }

        const posOrderUser = findOrder(user.perfil.historicOrders, orderId);

        if (posOrderUser === -1) {
            return res.status(404).json({ error: "Encomenda não encontrados" });
        }

        const orderDeleteUser = user.perfil.historicOrders[posOrderUser];
        const photoComment = orderDeleteUser.commentPhoto;

        let restaurant = await Restaurant.findOne({ 
            name: orderDeleteUser.restaurant.name, 
            'perfil.email': orderDeleteUser.restaurant.email,
            'perfil.phoneNumber': orderDeleteUser.restaurant.phoneNumber,
            'perfil.historicOrders._id': orderId,
            'perfil.historicOrders.type': 'pickup',
        }).exec();

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurante não encontrado" });
        }
        
        user.perfil.historicOrders[posOrderUser].comment = "";
        user.perfil.historicOrders[posOrderUser].commentPhoto = "";
        await user.save();

        const posOrderDeleteRest = findOrder(restaurant.perfil.historicOrders, orderId);
        if (posOrderDeleteRest === -1) {
            return res.status(404).json({ error: "Encomenda não encontrados" });
        }

        restaurant.perfil.historicOrders[posOrderDeleteRest].comment = "";
        restaurant.perfil.historicOrders[posOrderDeleteRest].commentPhoto = "";
        await restaurant.save();

        if(photoComment !== "") {
            const deletePhoto = "public" + photoComment;
            deleteImage(deletePhoto)
        }

        return res.status(200).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error});
    }
}


module.exports = commentController;