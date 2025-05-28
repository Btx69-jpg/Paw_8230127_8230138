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
 * */
historicOrderController.searchOrderHistoric = async function(req, res) {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: "O id do utilizador é de preenchimento obrigatório" });
        }

        const { nameRest, price, dateFrom, dateTo, order } = req.query;

        const user = await User.findById(userId).lean().exec();
        if (!user || !user.perfil || !user.perfil.historicOrders) {
            return res.status(404).json({ error: "Utilizador não encontrado ou sem histórico de encomendas" });
        }

        let filteredOrders = user.perfil.historicOrders;

        if (nameRest) {
            filteredOrders = filteredOrders.filter(order =>
                order.restaurant?.name?.toLowerCase().includes(nameRest.toLowerCase())
            );
        }

        if (price) {
            const priceNumber = Number(price);
            
            if (priceNumber <= 0) {
                return res.status(422).json({ error: "O preço deve ser superior a 0.00 €" });
            }

            filteredOrders = filteredOrders.filter(order => order.price >= priceNumber);
        }

        if (dateFrom || dateTo) {
            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo) : null;

            if (fromDate && fromDate > new Date()) {
                return res.status(422).json({ error: "A data inicial deve ser inferior ou igual à data atual" });
            }

            if (toDate && toDate < new Date("2000-01-01")) {
                return res.status(422).json({ error: "A data final não pode ser anterior a 2000-01-01" });
            }

            if (fromDate && toDate && toDate < fromDate) {
                return res.status(422).json({ error: "A data de fim deve ser posterior à data de início" });
            }

            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.date);
                return (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);
            });
        }

        // Ordenação
        switch (order) {
            case 'nameAsc':
                filteredOrders.sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));
                break;
            case 'nameDesc':
                filteredOrders.sort((a, b) => b.restaurant.name.localeCompare(a.restaurant.name));
                break;
            case 'priceAsc':
                filteredOrders.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                filteredOrders.sort((a, b) => b.price - a.price);
                break;
            case 'dateAsc':
                filteredOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'dateDesc':
                filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        filteredOrders.forEach(order => {
            delete order.client;
        });

        return res.status(200).json(filteredOrders);
    } catch (error) {
        console.error("Erro: ", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};


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