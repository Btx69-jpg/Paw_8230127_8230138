var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../../Models/Perfils/User");
const Portion = require("../../Models/Portion");
const Restaurant = require("../../Models/Perfils/Restaurant");
const Item = require("../../Models/Orders/Item");  
const Cart = require("../../Models/Orders/Order");  

//Controllers
const menuController = require("../ControllersRestaurant/MenuController");

//Funções
const { deleteImage } = require("../Functions/crudImagesRest");

/**
 * TODO: Falta depois fazer o redirect correto.
 */

var userController = {};

userController.getUsers = function(req, res) {
    User.find({}).exec()
    .then(users => {
        if (!users) {
            return res.status(404).json({ error: "Ainda não existem utilizadores" });
        }

        res.status(200).json(users);
    })
    .catch(error => {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: error });
    });
}

userController.getUser = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilizador não encontrado" });
            }

            res.status(200).json(user);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error });
        });
}

userController.isUserBannedOrders = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilizador não encontrado" });
            }

            const isBan = user.bannedOrder;
            res.status(200).json(isBan);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error });
        });
}

/**
 * * O campo perfil Foto está sem validações
 */
function validateCamposUser(firstName, lastName, email, phoneNumber, birthdate) {
    if (!firstName || !lastName || !email || !phoneNumber) {
        return "Algum dos campos obrigatorio não estão preenchidos";
    }

    const regexName = /^[a-zA-Z\\s]*$/;
    if (firstName.length > 50 || !regexName.test(firstName)) {
        return "O campo primeiro nome do utilizador está mal preenchido";
    }

    if (lastName.length > 50 || !regexName.test(lastName)) {
        return "O campo último nome do utilizador está mal preenchido";
    }

    const regexEmail = /^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/;
    if (email.length > 50 || !regexEmail.test(email)) {
        return "O campo email do utilizador está mal preenchido";
    }

    if (phoneNumber < 100000000 || phoneNumber > 999999999) {
        return "O numero de telefone introduzido está mal inserido";
    }

    if (birthdate && (birthdate < "1900-01-01" || birthdate > Date.now())) {
        return "A data de nascimento introduzido é inválida"
    }
    
    return "";
}

userController.getUserEdit = function(req, res) {
    User.findById(req.params.userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "Utilizador não encontrado" });
            }

            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                perfil: {
                    phoneNumber: user.perfil.phoneNumber,
                    email: user.perfil.email,
                    perfilPhoto: user.perfil.perfilPhoto
                },
                birthdate: user.birthdate
            });
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error });
        });
}


/**
 * * Permite atualizar os dados do utilizador
 */
userController.editUser = async function(req, res) {
    const userId = req.params.userId;
    try {
        let user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({error: "O utilizador não foi encontrado"})
        } 
        
       const { firstName, lastName, email, phoneNumber, birthdate } = req.body;

        const errorCampos = validateCamposUser(firstName, lastName, email, phoneNumber, birthdate);
        if (errorCampos !== "") {
            console.log("Campo obrigatorio mal preenchido", errorCampos)
            return res.status(422).json({error: errorCampos});
        }

        let update = false;
        if (user.firstName !== firstName) {
            user.firstName = firstName;
            update = true;
        }

        if (user.lastName !== lastName) {
            user.lastName = lastName;
            update = true;
        }

        if (user.perfil.email !== email) {
            user.perfil.email = email;
            update = true;
        }

        if (user.perfil.phoneNumber !== phoneNumber) {
            user.perfil.phoneNumber = phoneNumber;
            update = true;
        }

        if (!user.birthdate || user.birthdate !== birthdate) {
            user.birthdate = birthdate;
            update = true;
        }

        let oldPhoto = user.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';

        if (pathNewImg && oldPhoto !== pathNewImg) {
            console.log("Nova imagem de perfil")
            pathNewImg = "/" + pathNewImg.replace(/^public[\\/]/, "");
            user.perfil.perfilPhoto = pathNewImg;
            update = true;
        }

        if (!update) {
            res.stauts(422).json({error: "Não houve nenhuma alteração nos dados do utilizador"})
        }

        await user.save();

        if (pathNewImg !== '' && oldPhoto !== pathNewImg) {
            const oldFilePath = "public" + oldPhoto;
            deleteImage(oldFilePath);
        }
        
        res.status(200).json(user);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: err});
    }    
}

userController.deleteUser = async function(req, res) {
    try {
        const user = await User.findOne({ _id: req.params.userId }).exec();

        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }

        let imagePath = user.perfil.perfilPhoto;
            
        if (user.perfil.priority === "Dono" && user.perfil.restaurantIds) {
            await Restaurant.updateMany(
                { _id: { $in: user.perfil.restaurantIds } },
                { $pull: { 'perfil.ownersIds': user._id } }
            ).exec();
        }

        await user.deleteOne();
        console.log("User eliminado com sucesso!");

        if (imagePath !== "") {
            const deletePath = "public" + imagePath;
            deleteImage(deletePath);
        }

        res.status(200).json(user)
    } catch (error) {
        console.log("Erro ao eliminar o user: ", error);
        res.status(500).json({ error: error });
    }
}

userController.addToCart = async function(req, res) {
    try {
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("---------------------------------------------");
        console.log("Adicionar cart");
        const userId = res.locals.user._id;
        const dishId = req.params.dishId;
        const portionId = req.params.portionId;
        const menuId = req.params.menu;
        const restaurantName = req.params.restaurant;

        const quantity = parseInt(req.body.quantity, 10); // Obter a quantidade do formulário
        if (isNaN(quantity) || quantity <= 0) {
            return res.render("errors/error", { numError: 400, error: "Quantidade inválida" });
        }

        const user = await User.findById(userId).exec();
        if (!user) {
            return res.render("errors/error", { numError: 404, error: "Utilizador não encontrado" });
        }

        const restaurant = await Restaurant.findOne({ name: restaurantName }).exec();
        if (!restaurant) {
            return res.render("errors/error", { numError: 404, error: "Restaurante não encontrado" });
        }

        const cart = user.cart;
        
        if (cart.itens && cart.itens.length > 0 && cart.itens[0].from.toString() !== restaurant._id.toString()) {
            console.log("Restuarante diferente");
            return res.status(422).redirect(`/restaurants/${restaurantName}`);
        }

        const itens = cart.itens;
        let totItens = 0;
        let i = 0;
        const limiteRest = restaurant.maxOrdersPerClient;
        while (i < itens.length && totItens < limiteRest) {
            const item = itens[i];
            totItens += item.quantity;
            i++;
        }

        if (totItens + quantity > limiteRest) {
            console.log("Limites de pedidos atingido pelo utilizador");
            return res.status(422).redirect(`/restaurants/${restaurantName}`);
        }

        const portion = await Portion.findById(portionId).exec();
        if (!portion) {
            return res.render("errors/error", { numError: 404, error: "Porção não encontrada" });
        }

        let item;
        let exist = false;

        for (let i = 0; i < restaurant.menus.length; i++) {
            let menu = restaurant.menus[i];
            if (menu._id.toString() === menuId) {
                for (let j = 0; j < menu.dishes.length; j++) {
                    if (menu.dishes[j]._id.toString() === dishId) {
                        for (let k = 0; k < menu.dishes[j].portions.length; k++) {
                            if (menu.dishes[j].portions[k].portion.toString() === portionId) {
                                item = new Item({
                                    from: restaurant._id,
                                    menuId: menu._id,
                                    photo: menu.dishes[j].photo,
                                    item: menu.dishes[j].name,
                                    portion: portion.portion,
                                    price: menu.dishes[j].portions[k].price,
                                    quantity: quantity, // Usar a quantidade fornecida
                                });
                                
                                exist = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!exist) {
            return res.render("errors/error", { numError: 404, error: "Prato não encontrado no menu" });
        }

        if (!user.cart) {
            user.cart = new Cart({
                itens: [item],
                price: item.price * quantity,
                status: "Pendente",
            });
        } else {
            let itens = user.cart.itens;
            exist = false;

            for (let i = 0; i < itens.length; i++) {
                if (itens[i].from.toString() === item.from.toString() && itens[i].item === item.item &&
                    itens[i].portion === item.portion) {
                    itens[i].quantity += quantity; // Adicionar a quantidade
                    user.cart.price += item.price * quantity; // Atualizar o preço total
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                user.cart.price += item.price * quantity; // Atualizar o preço total
                itens.push(item);
            }

            user.cart.itens = itens;
        }

        await user.save();
        res.locals.user = user;
        menuController.showMenu(req, res);
    } catch (error) {
        console.error("Error: ", error);
        return res.render("errors/error", { numError: 500, error: error });
    }
  };

userController.cleanCart = async function(req, res) {
    try {
        const userId = req.params.UserId;
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({error: "Utilizador não encontrado" });
        }
        if (!user.cart) {
            return res.status(404).json({error: "Utilizador não tem carrinho" });
        }

        user.cart.itens = [];
        user.cart.price = 0;
        await user.save();
        
        res.locals.user = user;
        res.status(200).json(user.cart);
    } catch (error) {
        console.log("Erro ao limpar o carrinho: ", error);
        return res.status(500).json({error: error });
    }
  }

userController.getCart = async function(req, res) {
    try {
        const userId = req.params.UserId;
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.render("errors/error", { numError: 404, error: "Utilizador não encontrado" });
        }

        res.status(200).json(user.cart);
      }
    catch (error) {
        console.log("Erro ao obter o carrinho: ", error);
        return res.status(500).json({error: error });
    }
}

userController.saveCart = async function(req, res) {
    try {
        const userId = req.params.UserId;
        const user = await User.findById(userId).exec();
        
        if (!user) {
            return res.render("errors/error", { numError: 404, error: "Utilizador não encontrado" });
        }
        
        user.cart = req.body;
        await user.save()

        res.status(200).json({});
    } catch (error) {
        console.log("Erro ao obter o carrinho: ", error);
        return res.render("errors/error", { numError: 500, error: error });
    }
}

//Função para adicionar o pedido realizado nas encomendas do utilizador e do rest
userController.saveNewOrder = async function(req, res) {
    try {
        console.log("\n\n\n\n\n\nENTROU NO SAVE ORDER\n\n\n\n\n");
        const userId = req.params.UserId;
        const restaurantId = req.params.restId;
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.render("errors/error", { numError: 404, error: error });
        }
        if (!user.cart || user.cart.itens.length === 0) {
            return res.render("errors/error", { numError: 404, error: error });
        }

        const restaurant = await Restaurant.findById(restaurantId).exec();
        if (!restaurant) {
            return res.render("errors/error", { numError: 404, error: "Restaurante não encontrado" });
        }



        let order = req.body;
        let newOrder = new Cart({
            date: order.date,
            client: order.client,
            restaurant: order.restaurant,
            address: order.address,
            itens: order.itens,
            price: order.price,
            status: "Pendente",
            type: 'delivery',
        });
        console.log("\n\n\n\n\n\nNova encomenda: ", newOrder, "\n\n\n\n\n");
        
        user.perfil.orders.push(newOrder);
        user.cart.itens = [];
        user.cart.price = 0;
        await user.save();
        restaurant.perfil.orders.push(newOrder);
        await restaurant.save();
        console.log("\n\n\n\n\n\nEncomenda salva com sucesso!\n\n\n\n\n\n");
        res.status(200).json({ message: "Encomenda salva com sucesso!" });
    } catch (error) {
        console.log("Erro ao salvar a nova encomenda: ", error);
        return res.render("errors/error", { numError: 500, error: error });
    }
}


userController.getRestNameAndAddress = async function(req, res) {
    try {
        const restId = req.params.restId;
        const restaurant = await Restaurant.findById(restId).exec();
        if (!restaurant) {
            return res.render("errors/error", { numError: 404, error: "Utilizador não encontrado" });
        }
        const restName = restaurant.name;
        const restAddress = restaurant.address.street + ", " + restaurant.address.postal_code + " " + restaurant.address.city;
        res.status(200).json({ restaurantName: restName, restaurantAddress: restAddress });
    }
    catch (error) {
        console.log("Erro ao obter o nome e endereço do restaurante: ", error);
        return res.render("errors/error", { numError: 500, error: error });
    }
}


module.exports = userController;