var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../../Models/Perfils/User");
const Dish = require("../../Models/Menus/Dish");
const Portion = require("../../Models/Portion");

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

/**
 * * O campo perfil Foto está sem validações
 */
function validateCamposUser(firstName, lastName, email, phoneNumber, perfilPhoto, birthdate) {
    if (!firstName || !lastName || !email || !phoneNumber || !perfilPhoto || !birthdate) {
        return "Algum dos campos obrigatorio não estão preenchidos";
    }

    const regexName = /^[a-zA-Z\\s]*$/;
    if (firstName.length > 50 || !regexName.test(firstName)) {
        return "O campo primeiro nome do utilizador está mal preenchido";
    }

    if (lastName.length > 50 || !regexName.test(lastName)) {
        return "O campo último nome do utilizador está mal preenchido";
    }

    const regexEmail = /^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})*$/;
    if (email.length > 50 || !regexEmail.test(email)) {
        return "O campo email do utilizador está mal preenchido";
    }

    if (phoneNumber < 100000000 || phoneNumber > 999999999) {
        return "O numero de telefone introduzido está mal inserido";
    }

    if (birthdate < "1900-01-01" ||birthdate > Date.now() ) {
        return "A data de nascimento introduzido é inválida"
    }
    
    return "";
}
/**
 * !!!!Falta testar
 * !!Falta ver como passar a imagem, como parametro para alterar
 * !!Depois adapatar o codigo para funcionar para com a imagem
 */
userController.editUser = async function(req, res) {
    try {
        const userId = req.params.userId;
        let user = await User.findById(userId).exec();

        if(!user) {
            return res.status(404).json({error: "O utilizador não foi encontrado"})
        }

        console.log("Body: ", req.body);
        const { firstName, lastName, perfil, birthdate} = req.body;
        const {email, phoneNumber, perfilPhoto} = perfil;  

        const errorCampos = validateCamposUser(firstName, lastName, email, phoneNumber, perfilPhoto, birthdate);
        if (errorCampos !== "") {
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

        if (user.perfil.perfilPhoto !== perfilPhoto) {
            user.perfil.perfilPhoto = perfilPhoto;
            update = true;
        }

        if (!user.birthdate || user.birthdate !== birthdate) {
            user.birthdate = birthdate;
            update = true;
        }

        if (!update) {
            res.stauts(422).json({error: "Não houve nenhuma alteração nos dados do utilizador"})
        }

        await user.save();
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
            deleteImg(imagePath);
        }

        res.status(200).json(user)
    } catch (error) {
        console.log("Erro ao eliminar o user: ", error);
        res.status(500).json({ error: error });
    }
}

userController.addDish = async function(req, res) {
    try {
        const userId = res.locals.User._id;
        const dishId = req.params.dishId;
        const portionId = req.params.portionId;
        const menuId = req.params.menuId;
        const restaurantName = req.params.restaurant;

        const user = await User.findById(userId).exec();

        if (!user) {
            res.render("errors/error", { numError: 404, error: err });
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }

        let item;

        const restaurant = await Restaurant.find({name: restaurantName}).exec();
        
        if (!restaurant) {
            res.render("errors/error", { numError: 404, error: err });
            return res.status(404).json({ error: "Restaurante não encontrado" });
        }

        const portion = Portion.findById(portionId).exec();
        if (!portion) {
            res.render("errors/error", { numError: 404, error: err });
            return res.status(404).json({ error: "Porção não encontrada" });
        }
        let exist = false;

        for (menu of restaurant.menus) {
            if (menu._id.toString() === menuId) {
                for (let i = 0; i < menu.dishes.length; i++) {
                    if (menu.dishes[i]._id.toString() === dishId) {
                        item = new Item({
                            from: restaurant._id,
                            item: menu.dishes[i].name,
                            portion: portion.name,
                            price: menu.dishes[i].price,
                            quantity: 1,
                        });
                        exist = true;
                        break;
                    }
                }
            }
        }
        if (!exist) {
            res.render("errors/error", { numError: 404, error: err });
            return res.status(404).json({ error: "Prato não encontrado no menu" });
        }

        let itens = itens;
        for (let i = 0; i < itens.length; i++) {
            if (itens[i].from === item.from && itens[i].item === item.item && itens[i].portion === item.portion) {
                itens[i].quantity += 1;
                await user.save();
                //verificar se é preciso
                return res.status(200).json(user);
            }
        }
        
        itens.push({
            item
        });
        await user.save();

    }
    catch (error) {
        res.render("errors/error", { numError: 500, error: err });
        res.status(500).json({ error: error });
    }
}

module.exports = userController;