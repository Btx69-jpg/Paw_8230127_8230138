var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../../Models/Perfils/User");

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

async function validateUpdateUser(user, email, phoneNumber, priority, restaurant) {
    if (priority === "Dono" && !restaurant) {
        return "Não existe nenhum restaurante com esse nome!"
    }

    const existingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: [
            { 'perfil.email': email },
            { 'perfil.phoneNumber': phoneNumber }
        ]
    }).exec();

    if (existingUser) {
        if (existingUser.perfil.email === email) {
            return "Já existe um utilizador com esse email!";
        } else {
            return "Já existe um utilizador com esse numero telefonico!";
        }
    }

    return "";
}

function validationUpdate(firstName, lastName, email, phoneNumber, priority, restaurant) {
    let errors = [];

    if (!firstName || !lastName || !email || !phoneNumber) {
        errors.push({ texto: "Todos os campos são obrigatórios!" });
    }

    if(priority === "Admin" && !restaurant) {
        errors.push({ texto: "Quando a prioridade é admin, o campo restaurante é de preenchimento obrigatório"})
    }

    return errors;
}

async function restaurantsSemDuplciacoes(restaurants, priority) {
    if(!restaurants) {
        return [];
    } 
    
    if (priority ==="Dono" && !Array.isArray(restaurants)) {
        restaurants = [restaurants];
    }

    let error = false;
    let i = 0;
    //Remove os duplicados do array
    while(i < restaurants.length && !error) {
        if(restaurants[i]) {
            for (let y = restaurants.length - 1; y > i; y--) {
                if (restaurants[i].name === restaurants[y].name) {
                    restaurants.splice(y, 1);
                }
            }
        } else {
            error = true;
        }
        i++;
    }
    
    if(error) {
        throw new Error("Existe algum campo de restaurante por preencher!");
    }
    //Transformamos o array restaurantes, de um array de objetos para um array só com os nomes
    console.log("Restaurantes: ", restaurants)
    let namesRestaurants = [];
    for (let i = 0; i < restaurants.length; i++) {
        namesRestaurants[i] = restaurants[i].name;
    }

    return namesRestaurants;
}

/**
 * !!!!Falta testar
 */
userController.editUser = async function(req, res) {
 try {
        const { firstName, lastName, email, phoneNumber, priority} = req.body;  

        const restaurantsNames = req.body.restaurant;
        
        //Retiramos os restaurants duplicados
        let restaurants;
        try {
            restaurants = await restaurantsSemDuplciacoes(restaurantsNames, priority);
        } catch (err) {
            console.error("Existe um restaurante que não foi preenchido:", err.message);
            return res.status(404).json({error: err});
        }
    
        //Validações aos campos
        let errors = await validationUpdate(firstName, lastName, email, phoneNumber, priority, restaurants);
        if (errors.length > 0) {
            return res.render("perfil/admin/pagesAdmin/Users/listUsers", { errors, firstName, lastName, email });
        }
    
        let restaurantFound = await Restaurant.find({ name: { $in: restaurants}}).exec();
        console.log("Restaurantes encontrados: ", restaurantFound);
        let user = await User.findOne({ _id: req.params.userId }).exec();
 
        //Está aqui um problema
        let errorValidate = await validateUpdateUser(user, email, phoneNumber, priority, restaurantFound);
    
        if(errorValidate !== "") {
            req.flash("error_msg", errorValidate);
            console.log("Error: ", errorValidate);
            return res.status(422).json({errorValidate: errorValidate});
        }

        if (restaurants && restaurants.length > 0) {
            let foundIds = [];
            let restIds = [];

            for (let i = 0; i < restaurantFound.length; i++) {
                restIds.push(restaurantFound[i]._id);
                foundIds.push(restaurantFound[i]._id.toString());
            }

            if (user.perfil.priority !== "Dono" && priority === "Dono") {
                user.perfil.restaurantIds = restIds;

                // Adiciona dono nos restaurantes
                await Restaurant.updateMany(
                    { _id: { $in: user.perfil.restaurantIds } },
                    { $addToSet: { 'perfil.ownersIds': user._id } }
                ).exec();
            } else if (user.perfil.priority === "Dono" && priority === "Dono") {

                console.log("Já sou Dono");

                //Procuramos por novos restaurantes
                let oldIds = [];
                for(const rest of user.perfil.restaurantIds) {
                    oldIds.push(rest._id.toString());
                }
                console.log("Old Ids: ", oldIds);
                
                let newRestIds = []; 
                for(const rest of restaurantFound) {
                    const id = rest._id.toString();
                    if(!oldIds.includes(id)) {
                        newRestIds.push(rest._id)
                    }
                }

                let removeIds = []
                for(const rest of user.perfil.restaurantIds) {
                    const id = rest._id.toString();
                    if(!foundIds.includes(id)) {
                        removeIds.push(rest._id)
                    }
                }

                user.perfil.restaurantIds = restIds;
                await user.save();
                if(newRestIds.length > 0) {
                    //Adicionamos os novos donos aos restaurantes
                    await Restaurant.updateMany(
                        { _id: {$in: newRestIds}},
                        { $addToSet: { 'perfil.ownersIds': user._id } }
                    )
                }
                
                //Novo array de restaurants
                if(removeIds.length > 0) {
                    //Removemos os id do ownersIds dos que foram removidos
                    await Restaurant.updateMany(
                        { _id: { $in: removeIds} },
                        { $pull: { 'perfil.ownersIds': user._id } }
                    ).exec();
                }

            }
        }

        //Caso o user fosse dono e agora deixou de ser.
        if (user.perfil.priority === "Dono" && priority !== "Dono") {
            console.log("A prioridade foi alterada de dono para cliente")
            
            await Restaurant.updateMany(
                { _id: { $in: user.perfil.restaurantIds } },
                { $pull: { 'perfil.ownersIds': user._id } }
            ).exec();

            //Forma que encontrei para dar delete no campo
            user.perfil.restaurantIds = undefined;
            await user.save();
        }  
        
        //update
        user.firstName = firstName;
        user.lastName = lastName;
        user.perfil.email = email;
        user.perfil.phoneNumber = phoneNumber;
        user.perfil.priority = priority;
        
        //guardar as alterações
        await user.save()
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

module.exports = userController;