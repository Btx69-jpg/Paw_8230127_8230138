var mongoose = require("mongoose");

const User = require("../../../Models/Perfils/User");
const Restaurant = require("../../../Models/Perfils/Restaurant");

const { Types } = mongoose;
//Controllers
var OrderController = {};

/**
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
            console.log(orders)

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
    'perfil.email': { $regex: new RegExp(`^${restaurantOrder.email}$`, 'i') },
    'perfil.phoneNumber': { $eq: Number(restaurantOrder.phoneNumber) }
  }).exec();
}

OrderController.cancelOrder = async function(req, res) {
    try {
        const userId = req.params.userId;
        let user = await User.findById(userId).exec();
        
        let validation = validateUser(user);
        if (validation !== "") {
            return res.status(404).json({ error: validation});
        }

        if (user.bannedOrder) {
            return res.status(404).json({ error: "O utilizador não pode cancelar porque ele está banido de realizar ou eliminar encomendas"});
        }

        const dataAtual = Date.now();
        if (user.cancelOrder > 0 && user.firstCancel) {
            const tempoCancel = dataAtual - new Date(user.firstCancel).getTime();
            const trintaDias = 30 * 24 * 60 * 60 * 1000;

            if (tempoCancel > trintaDias && user.cancelOrder < 5) {
                user.cancelOrder = 0;
                user.firstCancel = null;
            }

        }
       
        const orderDel = req.params.orderId;
        const orders = user.perfil.orders;
        const posOrderDelete = findOrder(orders, orderDel);
        
        if (posOrderDelete === -1) {
            console.log("A encomenda a eliminar não existe!");
            return res.status(302).json({error: "A encomenda a eliminar não existe!"});
        }

        const orderCancel = orders[posOrderDelete]

        //Verificações de cancelamento
        const tempoOrder = dataAtual - new Date(orderCancel.date).getTime(); 
        const cincoMinutos = 5 * 60 * 1000; 

        if (tempoOrder > cincoMinutos) {
            console.log("A encomenda não pode ser cancelarda, pois já passou mais de 5 minutos após ser realizada");
            return res.status(302).json({error: "A encomenda não pode ser cancelarda, pois já passou mais de 5 minutos após ser realizada"})
        }

        if (orderCancel.status !== 'Pendente') {
            console.log( `A encomenda não pode ser eliminada pois está no estado de ${orderCancel.status}`);
            return res.status(302).json({error: `A encomenda não pode ser eliminada pois está no estado de ${orderCancel.status}`})
        }

        const restaurantOrder = orderCancel.restaurant;

        let restaurant = await findRestaurantOrder(restaurantOrder);
        console.log("Restaurante: ", restaurant);
        
        if (!restaurant || restaurant === null) {
            return res.status(404).json( {error: "O restaurante não foi encontrado"}); 
        }

        if (!restaurant.perfil || !restaurant.perfil.orders) {
            return res.status(422).json({ error: "O restauranet não tem encomendas"});
        }

        if (!user.cancelOrder) {
            user.cancelOrder = 1;
            user.firstCancel = Date.now();
        } else {
            user.cancelOrder++;
        }

        if (user.cancelOrder === 5) {
            user.bannedOrder = true;
            user.dateBannedOrder = Date.now();
        }

        user.perfil.orders.splice(posOrderDelete, 1);
        await user.save();

        restaurant.perfil.orders.splice(restaurantOrder, 1);
        await restaurant.save();

        console.log("Encomenda cancelada");
        res.status(200).json({});
    } catch(error) {
        console.log("Error:", error);
        res.status(500).json({error: error});
    }
}

OrderController.search = async function(req, res) {
    try {
        //A Query não recebe nada
        console.log("Query: ", req.query);
        const { nameRest, status } = req.query;
        const userId = req.params.userId;

        if(!userId) {
            return res.status(500).json({error: "O id do utilizador é de preenchimento obrigatório"});
        }
        
        const user = await User.findById(userId).select({
            'perfil.orders': 1,  
        }).lean().exec();

        const orders = user?.perfil?.orders || [];

        const ordersFiltered = orders.filter(order => {
            if (nameRest && order.restaurant.name !== nameRest) {
                return false;
            }

            if (status && (order.status !== status && status !== "all")) {
                return false;
            }

            delete order.client;
            return true;
        });

        console.log("Encomendas encontradas: ", ordersFiltered);

        return res.status(200).json(ordersFiltered);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error});
    }
}

module.exports = OrderController;