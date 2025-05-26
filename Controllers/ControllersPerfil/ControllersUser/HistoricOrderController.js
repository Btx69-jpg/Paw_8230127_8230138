var mongoose = require("mongoose");

//Models
const User = require("../../../Models/Perfils/User.js");

//Controllers
var historicOrderController = {};

/**
 * * Retorna o historico de encomendas de um cliente
 * * NOTA: o .lean, ele faz com que a pesquisa retorne objetos JavaScript puros, em vez de documentos 
 * * Mongo o que permite fazer mainuplações delete como a de baixo, e outro tipo de manipulações
 * * sem afetar claro o mongo.
 * */
historicOrderController.gethistoricOrder = function(req, res) {
    const userId = req.params.userId;
    User.findById(userId).lean().exec()
        .then(user => {
            console.log("Utilizador Encontrado:", user);
            if (!user) {
                return res.status(404).json({ error: "Utilizador não encontrado" });
            }

            const historicOrders = user.perfil.historicOrders;
            if (!historicOrders) {
                return res.status(404).json({ error: "Utilizador sem historico de encomendas" });
            }

            historicOrders.forEach(order => {
                delete order.client;  
            });

            res.status(200).json(historicOrders);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error });
        });
}

/** 
 * * Metodo que filta no hisotrico de encomendas
 * TODO: Quando as encomendas estiverem a dar a 100%, testar com um utilizador com várias.
 * */
historicOrderController.searchOrderHistoric = async function(req, res) {
    try {
        let query = {};
        const userId = req.params.userId;
        
        if(!userId) {
            return res.status(500).json({error: "O id do utilizador é de preenchimento obrigatório"});
        }
        query._id = userId;

        const {nameRest, price, dateFrom, dateTo, order} = req.query;

        if (nameRest) {
            query['perfil.historicOrders.restaurant.name'] = { "$regex": nameRest, "$options": "i" };
        } 
    
        if (price) {
            if(price <= 0) {
                res.status(422).json({error: "O preço deve ser superior a 0.00 €"})
            }
            query['perfil.historicOrders.price'] = {$gte: Number(price)};
        }


        if (dateFrom || dateTo) {
            if(dateFrom && dateTo && (dateTo > dateFrom)) {
                return res.status(422).json({error: "A data de fim deve ser superior há de inicio!"})
            }
            
            query['perfil.historicOrders.date'] = {};
            if (dateFrom) {
                const date = new Date(dateFrom);
                if(date > Date.Now) {
                    return res.status(422).json({error: "A data final deve ser inferior ou igual há data atual"})
                }
                query['perfil.historicOrders.date'].$gte = new Date(date);
            }
            
            if (dateTo) {
                const date = new Date(dateFrom);
                const minDate = new Date('2000-01-01');
                if(date < minDate) {
                    return res.status(422).json({error: "A data inicial não pode ser anterior a 2000-01-01"})
                }
                query['perfil.historicOrders.date'].$lte = new Date(dateTo);
            }
        }

        let sortObj = null;
        switch (order) {
            case 'nameAsc': {
                sortObj = { 'perfil.historicOrders.restaurant.name': 1 };
                break;
            } case 'nameDesc': {
                sortObj = { 'perfil.historicOrders.restaurant.name': -1 };
                break;
            } case 'priceAsc': {
                sortObj = { 'perfil.historicOrders.price': 1 };
                break;
            } case 'priceDesc': {
                sortObj = { 'perfil.historicOrders.price': -1 };
                break;
            } case 'dateAsc': {
                sortObj = { 'perfil.historicOrders.date': 1 };
                break;
            } case 'dateDesc': {
                sortObj = { 'perfil.historicOrders.date': -1 };
                break;
            } default: {
                break;
            }
        }
        let user = null;

        if(sortObj) {
            user = await User.findOne(query).sort(sortObj).lean().exec();
        } else {
            user = await User.findOne(query).lean().exec();
        }
            
        if(!user) {
            return res.status(404).json({ error: "Utilizador não encontrado ou encomenda não existe" });
        }

        console.log("Utilizador encontrado: ", user);
        const historicOrders = user.perfil.historicOrders;
        if (!historicOrders) {
            return res.status(404).json({ error: "Utilizador sem historico de encomendas" });
        }

        historicOrders.forEach(order => {
            delete order.client;
        });
    
        res.status(200).json(historicOrders);   
    } catch(error) {
        console.error("Erro: ", error)
        res.status(500).json({error: error});
    }
}

/* Página que cria uma nova morada (limite de moradas é 5) */
historicOrderController.showOrder = async function(req, res) {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    User.findOne(
        { 
            _id: userId,
            'perfil.historicOrders._id': orderId 
        },
        { 
            'perfil.historicOrders.$': 1,
        }
    ).lean().exec()
        .then(userOrder => {
            if (!userOrder) {
                return res.status(404).json({ error: "Utilizador não encontrado ou não possui essa encomenda" });
            }
    
            const orders = userOrder.perfil.historicOrders;
            if (!orders || orders.length === 0) {
                return res.status(404).json({ error: "Encomenda não encontrada no histórico do utilizador" });
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


module.exports = historicOrderController;