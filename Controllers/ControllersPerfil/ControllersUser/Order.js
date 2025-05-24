var mongoose = require("mongoose");

const User = require("../../../Models/Perfils/User");
const Restaurant = require("../../../Models/Perfils/Restaurant");

//Controllers
var OrderController = {};

/**
 * TODO: Testar este codigo
 * 
 * * Retorna as encomendas em tempo real do utilizador
 * */
OrderController.getOrders = function(req, res) {
    const userId = req.params.userId;
    User.findById(userId).lean().exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilizador não encontrado" });
            }

            const orders = user.perfil.orders;
            if (!orders) {
                return res.status(404).json({ error: "Utilizador sem historico de encomendas" });
            }

            //Remover os dados do cliente na encomenda
            orders.forEach(order => {
                delete order.client;  
            });

            res.status(200).json(orders);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error });
        });
}

OrderController.getOrder = function(req, res) {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    User.findOne(
        { 
            _id: userId,
            'perfil.orders._id': orderId 
        },
        { 
            'perfil.orders.$': 1,
        }
    ).lean().exec()
        .then(userOrder => {
            if (!userOrder) {
                return res.status(404).json({ error: "Utilizador não encontrado ou não realizou essa encomenda" });
            }
    
            const orders = userOrder.perfil.orders;
            if (!orders || orders.length === 0) {
                return res.status(404).json({ error: "Encomenda não encontrada nas encomendas do utilizador" });
            }
    
            const order = orders[0];
            delete order.client;
            res.status(200).json(order);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({error: error});
        });
}

//Reutilizar o codigo de cancelar que vai existir para o restaurante também cnacelar
function validateUser(user) {
    let error = "";
   
    if (!user || !user.perfil || !user.perfil.orders) {
        error = "O restaurante não existe ou não tem encomendas";
    } 

    return error;
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

async function findRestaurantOrder(restaurantOrder) {
    return await Restaurant.findOne({
        name: restaurantOrder.name, 
        'perfil.email': restaurantOrder.email, 
        'perfil.phoneNumber': Number(restaurantOrder.phoneNumber)
        }).exec();
}
/**
 * TODO: Testar este codigo
 * 
 * !Depois meter aqui as verificações que estão no enunciado, como se a encomenda estiver na 
 * !não poder ser cancelada
 */
OrderController.cancelOrder = async function(req, res) {
    try {
        const userId = req.params.userId;
        let user = await User.findById(userId).exec();
        
        let validation = validateUser(user);
        if (validation !== "") {
            return res.status(404).json({ error: validation});
        }

        const orderDel = req.params.orderId;
        const orders = user.perfil.orders;
        let posOrderDelete = findOrder(orders, orderDel);
        
        if (posOrderDelete === -1) {
            return res.status(302).json({error: "A encomenda a eliminar não existe!"});
        }

        const restaurantOrder = orders[posOrderDelete].restaurant;

        //* Procurar se o user existe, para se sim eliminar-lhe a encomenda.
        let restaurant = await findRestaurantOrder(restaurantOrder);
        
        if(!restaurant) {
            res.status(404).json( {error: "O restaurante não foi encontrado"}); 
        }

        if(!restaurant.perfil || !restaurant.perfil.orders) {
            return res.status(422).json({ error: "O restauranet não tem encomendas"});
        }

        posOrderDelete = findOrder(user.perfil.orders, orderDel);
        if (posOrderDelete === -1) {
            return res.status(422).json({error: "A encomenda a eliminar não existe!"});
        }

        user.perfil.orders.splice(posOrderDelete, 1);
        await user.save();

        restaurant.perfil.orders.splice(posOrderDelete, 1);
        await user.save();
        console.log("Encomenda cancelada");
    } catch(error) {
        res.status(500).json({error: error});
    }
}

module.exports = OrderController;